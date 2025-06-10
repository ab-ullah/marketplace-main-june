from django.apps import AppConfig
from django.conf import settings
from api.libs.sidecar_blocks.document_store.document_api import Context, DocumentApi


class DocumentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.documents'
    use_local = settings.AWS.local
    document_bucket = settings.AWS.document_bucket
    document_kms_key_id = settings.AWS.document_kms_key_id

    if document_bucket is None or document_bucket == "":
        raise AttributeError("Expected settings.AWS.document_bucket to be set")

    if document_kms_key_id is None or document_kms_key_id == "":
        raise AttributeError("Expected settings.AWS.document_kms_key_id to be set")

    context = Context(use_local=use_local)
    document_api = DocumentApi(document_bucket, document_kms_key_id)

    def ready(self):
        import api.documents.signals
