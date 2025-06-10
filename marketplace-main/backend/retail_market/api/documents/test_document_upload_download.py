import io
from django.test import TestCase
from django.apps import apps
from api.libs.sidecar_blocks.document_store.document_api import DocumentData


class DocumentUploadAndDownloadTestCase(TestCase):
    def test_documents_uploaded_can_be_downloaded(self):
        config = apps.get_app_config('documents')
        context = config.context
        upload_context = config.context
        document_api = config.document_api
        content_type = "application/text"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        dest_file_obj = io.BytesIO()
        document_data = DocumentData(content_type, origin_file_obj)
        document_path = document_api.upload(upload_context, document_data)

        document_api.get_fileobj(context, document_path, dest_file_obj)
        read_contents = dest_file_obj.getvalue()
        self.assertEqual(contents, read_contents)