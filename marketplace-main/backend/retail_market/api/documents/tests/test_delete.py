from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.documents.models import Document
from api.documents.tests.factories import DocumentFactory
from api.documents.tests.views.test_permissions import create_document_path
from api.partners.tests.factories import CompanyFactory, UserFactory, CompanyUserFactory


class DocumentDeleteAPITestCase(APITestCase):

    def setUp(self):
        Document.objects.all().delete()
        self.company = CompanyFactory()
        self.user = UserFactory()
        self.client.force_authenticate(self.user)
        self.document_path = create_document_path()
        self.company_user = CompanyUserFactory(user=self.user, company=self.company)

    def test_document_delete_view(self):
        document = DocumentFactory(
            company=self.company,
            document_path=self.document_path,
            uploaded_by_user=self.company_user
        )
        download_url = reverse('document-download', kwargs={'document_id': document.document_id})
        response = self.client.get(download_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        url = reverse('document-delete', kwargs={'pk': document.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(download_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.assertEqual(Document.objects.count(), 0)
        self.assertEqual(Document.include_deleted.count(), 1)
