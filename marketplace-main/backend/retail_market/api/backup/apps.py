from django.apps import AppConfig
from django.conf import settings

from api.backup.services.document_backup import DocumentBackup
from api.libs.sidecar_blocks.document_store.document_api import Context, DocumentApi


class BackupsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.backup'
    use_local = settings.AWS.local
    document_bucket = settings.AWS.document_bucket
    backup_document_bucket = settings.AWS.backup_bucket
    document_kms_key_id = settings.AWS.document_kms_key_id

    if document_bucket is None or document_bucket == "":
        raise AttributeError("Expected settings.AWS.document_bucket to be set")

    if backup_document_bucket is None or backup_document_bucket == "":
        raise AttributeError("Expected settings.AWS.backup_bucket to be set")

    if document_kms_key_id is None or document_kms_key_id == "":
        raise AttributeError("Expected settings.AWS.document_kms_key_id to be set")

    context = Context(use_local=use_local)
    document_api = DocumentApi(document_bucket, document_kms_key_id)
    backup_storage = DocumentBackup(document_api=document_api, s3_bucket=context.client, kms_key=document_kms_key_id,
                                    bucket_name=backup_document_bucket, document_context=context)

    def ready(self):
        import api.documents.signals
