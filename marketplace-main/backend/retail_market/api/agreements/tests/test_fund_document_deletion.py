from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.tests.factories import AdminUserFactory
from api.applications.tests.factories import ApplicationFactory
from api.documents.models import FundDocument, Document
from api.documents.tests.factories import DocumentFactory
from core.base_tests import BaseTestCase


class TestFundDocumentDeletion(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.setup_fund(company=self.company)
        self.application = self.get_application()
        self.client.force_authenticate(self.user)
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)

    def get_application(self):
        return ApplicationFactory(company=self.company, user=self.user, fund=self.fund)

    def create_fund_document(self, require_gp_sign=False, signer=None):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        fund_document = FundDocument.objects.create(
            document=document,
            fund=self.fund,
            require_signature=True,
            require_gp_signature=require_gp_sign,
            gp_signer=signer
        )
        return fund_document

    def test_fund_document_deletion(self):
        fund_document = self.create_fund_document()
        document = fund_document.document

        url = reverse('agreement-documents-list-view', kwargs={'fund_external_id': self.fund.external_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        delete_response = self.delete_document(document_id=fund_document.document_id)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        self.assertEqual(FundDocument.objects.count(), 0)
        self.assertEqual(FundDocument.include_deleted.count(), 1)

        self.assertEqual(Document.objects.filter(id=document.id).count(), 0)
        self.assertEqual(Document.include_deleted.filter(id=document.id).count(), 1)

    def test_fund_document_update(self):
        fund_document = self.create_fund_document()
        url = reverse('agreement-documents-list-view', kwargs={'fund_external_id': self.fund.external_id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        url = reverse('admin-funds-documents-update', kwargs={
            'pk': fund_document.id,
            'fund_external_id': self.fund.external_id
        })
        response = self.client.patch(url, data={'gp_signer': self.admin_user.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        fund_document.refresh_from_db()
        self.assertEqual(fund_document.gp_signer_id, self.admin_user.id)
