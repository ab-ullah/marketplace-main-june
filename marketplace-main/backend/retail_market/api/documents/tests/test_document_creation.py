import io
from uuid import uuid4

from django.apps import apps
from rest_framework.test import APITestCase

from api.documents.exceptions import MissingUploadedByUserException
from api.documents.models import Document
from api.libs.sidecar_blocks.document_store.document_api import DocumentData
from api.partners.tests.factories import CompanyFactory, CompanyUserFactory


def create_document_path():
    config = apps.get_app_config('documents')
    upload_context = config.context
    document_api = config.document_api
    content_type = "application/text"
    contents = b"The greatest document in human history"
    origin_file_obj = io.BytesIO(contents)
    document_data = DocumentData(content_type, origin_file_obj)
    document_path = document_api.upload(upload_context, document_data)
    return document_path


class DocumentCreationValidationTestCase(APITestCase):

    def setUp(self):
        self.company = CompanyFactory()
        self.company_user = CompanyUserFactory(company=self.company)
        self.document_path = create_document_path()

    def test_company_level_document_created_without_uploaded_by_user(self):
        Document.objects.create(
            document_path=self.document_path,
            title='Test Title',
            company=self.company,
            partner_id=uuid4().hex,
            content_type='application/pdf',
            extension='pdf',
            document_id=uuid4().hex,
            access_scope=Document.AccessScopeOptions.COMPANY.value
        )

    def test_user_document_created_without_user_raises(self):
        with self.assertRaises(MissingUploadedByUserException):
            Document.objects.create(
                document_path=self.document_path,
                title='Test Title',
                company=self.company,
                partner_id=uuid4().hex,
                content_type='application/pdf',
                extension='pdf',
                document_id=uuid4().hex,
            )

    def test_user_document_created_with_user(self):
        Document.objects.create(
            document_path=self.document_path,
            title='Test Title',
            company=self.company,
            partner_id=uuid4().hex,
            content_type='application/pdf',
            extension='pdf',
            document_id=uuid4().hex,
            uploaded_by_user=self.company_user
        )
