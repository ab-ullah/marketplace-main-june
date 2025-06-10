from django.apps import apps

from api.libs.sidecar_blocks.document_store.document_api import DocumentData


class UploadedDocumentInfo:
    def __init__(self, document_path: str, document_id: str, extension: str, content_type: str):
        self.document_path = document_path
        self.document_id = document_id
        self.extension = extension
        self.content_type = content_type


class UploadDocumentService:
    @staticmethod
    def upload(document_data, content_type=None):
        config = apps.get_app_config('documents')
        upload_context = config.context
        document_api = config.document_api
        if not content_type:
            content_type = document_data.content_type

        document_data = DocumentData(content_type, document_data)
        document_path = document_api.upload(upload_context, document_data)
        return UploadedDocumentInfo(
            document_path=document_path,
            document_id=document_data.document_id,
            extension=document_data.extension(),
            content_type=content_type
        )
