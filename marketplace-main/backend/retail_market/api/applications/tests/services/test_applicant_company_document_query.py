import io

from django.apps import apps
from rest_framework.test import APITestCase

from api.applications.models import ApplicationCompanyDocument
from api.applications.services.create_application_company_documents import ApplicationCompanyDocumentsService
from api.applications.tests.factories import ApplicationFactory
from api.companies.models import CompanyDocument
from api.documents.tests.factories import DocumentFactory
from api.libs.sidecar_blocks.document_store.document_api import DocumentData
from api.partners.tests.factories import CompanyFactory, UserFactory, CompanyUserFactory, FundFactory


def create_document_path(contents=None):
    if not contents:
        contents = b"The greatest document in human history"
    config = apps.get_app_config('documents')
    upload_context = config.context
    document_api = config.document_api
    content_type = "application/text"
    origin_file_obj = io.BytesIO(contents)
    document_data = DocumentData(content_type, origin_file_obj)
    document_path = document_api.upload(upload_context, document_data)
    return document_path


class ApplicantCompanyDocumentTestCase(APITestCase):

    def setUp(self):
        self.company = CompanyFactory()
        self.user_1 = UserFactory()
        self.user_2 = UserFactory()
        self.company_user_1 = CompanyUserFactory(company=self.company, user=self.user_1)
        self.company_user_2 = CompanyUserFactory(company=self.company, user=self.user_2)
        self.fund = FundFactory(company=self.company)
        self.document_path = create_document_path()

    def test_required_once_document(self):
        document = DocumentFactory(document_path=self.document_path)
        company_document = CompanyDocument.objects.create(
            company=self.company,
            document=document,
            name='Dummy Document',
            description='Dummy Document',
            required_once=True,
            require_wet_signature=True,
            require_gp_signature=True,
        )

        application_1 = ApplicationFactory(company=self.company, user=self.user_1, fund=self.fund)
        application_2 = ApplicationFactory(company=self.company, user=self.user_2, fund=self.fund)

        ApplicationCompanyDocument.objects.create(
            application=application_1,
            company_document=company_document,
            completed=True
        )

        application_2_documents = ApplicationCompanyDocumentsService(
            application=application_2
        ).get_documents()

        self.assertEqual(application_2_documents[0]['company_document']['id'], company_document.id)
