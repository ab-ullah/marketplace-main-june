import mimetypes
from uuid import uuid4

import boto3

# This assumes you have localstack running with the default configuration
LOCAL_URL = "http://localhost:4566/"


class Context:
    def __init__(self, use_local=False, prefix=""):
        """prefix if set must end with a trailing /
           use_local if true assumes localstack is running on localhost.
        """
        self.use_local = use_local

        if not use_local:
            self.client = boto3.client("s3")
        else:
            self.client = boto3.client("s3", endpoint_url=LOCAL_URL)

        if prefix is not None and prefix != "":
            if prefix[-1] != "/":
                raise AttributeError("invalid prefix: '{}' prefix must end with a trailing /".format(prefix))

        self.prefix = prefix


class DocumentData:
    def __init__(self, content_type, buffer, document_id=None):
        self.document_id = document_id if document_id else uuid4().hex
        self.content_type = content_type
        self.contents = buffer

    def extension(self) -> str:
        if self.content_type == "application/pdf":
            return "pdf"

        if self.content_type == "application/msword":
            return "doc"

        if self.content_type == "application/text":
            return "txt"

        extension = mimetypes.guess_extension(self.content_type)
        if extension:
            extension = extension.strip('.')
            return extension

        return "unknown"


class DocumentApi:
    """
    The DocumentData API, ensures that all content is encrypted.
    It assumes that one key will be used for the duration of a session and is initialized with one.
    """

    def __init__(self, destination, kms_key):
        self.destination = destination
        self.kms_key = kms_key

        if self.destination is None or self.destination == "":
            raise AttributeError("invalid destination: '{}' must be an S3 bucket".format(destination))

        if self.kms_key is None or self.kms_key == "":
            raise AttributeError("invalid key: '{}' must be a valid KMS key id".format(kms_key))

    @staticmethod
    def _key(prefix: str, document: DocumentData) -> str:
        """
        Store things on storage using hashed directories to keep operator sanity when hunting for a particular doc
        """
        dir1 = document.document_id[0:2]
        dir2 = document.document_id[2:4]
        return "{}{}/{}/{}.{}".format(prefix, dir1, dir2, document.document_id, document.extension())

    def upload(self, context: Context, document: DocumentData) -> str:
        """Since the destination is set when the API is instanciated we only return
        the path from that destination with this key"""
        key = self._key(context.prefix, document)
        context.client.upload_fileobj(document.contents,
                                      self.destination,
                                      key,
                                      ExtraArgs={'ServerSideEncryption': 'aws:kms',
                                                 'SSEKMSKeyId': self.kms_key,
                                                 "ContentType": document.content_type})
        return key

    def get_head_info(self, context: Context, key: str):
        return context.client.head_object(Bucket=self.destination, Key=key)

    def get_fileobj(self, context: Context, key: str, buffer):
        """Writes the contents of the file at key to buffer"""
        context.client.download_fileobj(self.destination, key, buffer)

    def get_obj(self, context: Context, key: str):
        """Writes the contents of the file at key to buffer"""
        return context.client.get_object(Bucket=self.destination, Key=key)
