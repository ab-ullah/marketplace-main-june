from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.tests.factories import AdminUserFactory
from api.applications.tests.factories import ApplicationFactory
from api.companies.models import CompanyDocument
from api.documents.tests.factories import DocumentFactory
from core.base_tests import BaseTestCase


class TestCompanyDocumentDeletion(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.setup_fund(company=self.company)
        self.application = self.get_application()
        self.client.force_authenticate(self.user)
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)

    def get_application(self):
        return ApplicationFactory(company=self.company, user=self.user, fund=self.fund)

    def create_company_document(self):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        company_document = CompanyDocument.objects.create(
            company=self.company,
            document=document,
            require_signature=True,
        )
        return company_document

    def test_company_document_deletion(self):
        company_document = self.create_company_document()
        url = reverse('application-company-documents',
                      kwargs={'fund_external_id': self.fund.external_id, 'skip_completed_required_docs': 'true'})

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        delete_url = reverse('admin-company-document-retrieve-update-destroy-view', kwargs={'pk': company_document.id})
        delete_response = self.client.delete(delete_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        self.assertEqual(CompanyDocument.objects.count(), 0)
        self.assertEqual(CompanyDocument.include_deleted.count(), 1)
