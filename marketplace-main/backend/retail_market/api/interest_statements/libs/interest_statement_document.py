from django.apps import apps
from api.documents.models import Document
from api.libs.sidecar_blocks.document_store.document_api import DocumentData

class InterestStatementDocument:
    def __init__(self, content_type, document_type):
        config = apps.get_app_config('documents')
        self.model = Document()
        self.model.content_type = content_type
        self.model.document_type = document_type
        self.model.title = 'InvestorDocument'
        self.upload_context = config.context
        self.document_api = config.document_api
        self.content_type = content_type


    def store(self, file_obj):
        document_data = DocumentData(self.content_type, file_obj)
        document_path = self.document_api.upload(self.upload_context, document_data)
        print(document_path)
        self.model.document_id = document_data.document_id
        self.model.document_path = document_path
        self.model.extension = document_data.extension()
        self.model.save()

        return self.model
