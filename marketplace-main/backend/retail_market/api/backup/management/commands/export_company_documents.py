import json
import logging
import csv

from django.apps import apps
from django.core.management import BaseCommand

from api.documents.models import Document

from api.backup.serializers import LasalleDocumentCompanyLevelBackup
from api.companies.models import Company
from django.db.models import ForeignObjectRel, Prefetch
logger = logging.getLogger(__name__)


def backup(company_name: str):
    backup_storage = apps.get_app_config('backup').backup_storage
    company: Company = Company.objects.get(name=company_name)
    output = company.backup_serialized_documents_to(LasalleDocumentCompanyLevelBackup, backup_storage)
    company.backup_documents_to(backup_storage)
    return output


def async_backup(company_name: str):
    res = backup(company_name)
    logger.info({**res, **{'message': "Successful"}})


class Command(BaseCommand):
    help = 'Backup everything regarding a company'

    def add_arguments(self, parser):
        parser.add_argument('company_name', type=str)
        parser.add_argument('--async', action="store_true")

    def handle(self, *args, **options):
        company_name = options['company_name']
        company: Company = Company.objects.get(name=company_name)
        serializer = LasalleDocumentCompanyLevelBackup()
        fieldnames = list(serializer.fields.keys())
        batch_size = 500
        backup_storage = apps.get_app_config('backup').backup_storage
        s3_bucket = backup_storage.s3_bucket
        kms_key = backup_storage.kms_key
        bucket_name = backup_storage.bucket_name
        object_key = f"company-backup-documents/{company.id}/2024/documents.csv"

        def _prefetch_reverse_relations(queryset, model):
            prefetches = []
            for field in model._meta.get_fields():
                if isinstance(field, ForeignObjectRel) and field.auto_created:
                    related_name = field.get_accessor_name()
                    prefetches.append(Prefetch(related_name))
            return queryset.prefetch_related(*prefetches)

        queryset = _prefetch_reverse_relations(company.company_documents.all(), Document)

        filepath = f'company_documents_my_backup.csv'
        with open(filepath, 'w') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for batch in queryset.order_by('id').iterator(chunk_size=batch_size):
                if len(batch.get_reverse_relations()) > 0:
                    serialized_data = LasalleDocumentCompanyLevelBackup(batch).data
                    writer.writerow(serialized_data)
        server_side_encryption = dict(ServerSideEncryption='aws:kms', SSEKMSKeyId=kms_key)
        s3_bucket.upload_file(filepath, bucket_name, object_key, ExtraArgs=server_side_encryption)
        company.backup_documents_to(backup_storage)
