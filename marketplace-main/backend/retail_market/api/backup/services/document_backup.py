import json
import csv
import logging
import os

from botocore.exceptions import ClientError
from django.core.serializers.json import DjangoJSONEncoder

logger = logging.getLogger()

class DocumentBackup:
    def __init__(self, document_api, s3_bucket, kms_key, bucket_name, document_context):
        self.document_context = document_context
        self.bucket_name = bucket_name
        self.s3_bucket = s3_bucket
        self.document_api = document_api
        self.kms_key = kms_key

    def backup_application(self, object_key, dump):
        json_string = json.dumps(dump, cls=DjangoJSONEncoder)
        self.s3_bucket.put_object(Bucket=self.bucket_name, Key=object_key, Body=json_string,
                                  ServerSideEncryption='aws:kms',
                                  SSEKMSKeyId=self.kms_key)

    def backup_document(self, document_path, backup_path):
        try:
            data = self.document_api.get_obj(context=self.document_context, key=document_path)
            self.s3_bucket.put_object(Key=backup_path, Bucket=self.bucket_name, Body=data['Body'].read(),
                                      ServerSideEncryption='aws:kms',
                                      SSEKMSKeyId=self.kms_key)
        except ClientError as ce:
            logger.warning(f"{ce.response=}")
            return False
        return True

    def backup(self, object_key, to_backup):
        keys = set()
        for dictionary in to_backup:
            keys.update(dictionary.keys())
        filepath = f'{hash(object_key)}_my_backup.csv'
        with open(filepath, 'w') as csvfile:
            fieldnames = list(keys)
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for value in to_backup:
                writer.writerow(value)
        server_side_encryption = dict(ServerSideEncryption='aws:kms', SSEKMSKeyId=self.kms_key)
        self.s3_bucket.upload_file(filepath, self.bucket_name, object_key, ExtraArgs=server_side_encryption)
        os.remove(filepath)
