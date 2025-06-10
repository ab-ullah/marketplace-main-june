import io

from rest_framework import status
from rest_framework.reverse import reverse

from api.admin_users.tests.factories import AdminUserFactory
from api.applications.tests.factories import ApplicationFactory, FundFactory
from api.companies.models import CompanyDocument
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import UserFactory, CompanyUserFactory
from core.base_tests import BaseTestCase


class TestRequiredOnceCompanyDocument(BaseTestCase):
    def setUp(self) -> None:
        self.create_company()
        self.create_user()
        self.setup_fund(company=self.company)
        self.client.force_authenticate(self.user)
        self.admin_user = AdminUserFactory(company=self.company, user=self.user)

    def get_application(self, fund):
        return ApplicationFactory(company=self.company, user=self.user, fund=fund)

    def create_company_document(self, require_signature=False, require_wet_signature=False, required_once=True):
        document = DocumentFactory(
            document_path=self.create_document_path(),
            company=self.company
        )
        company_document = CompanyDocument.objects.create(
            company=self.company,
            document=document,
            require_signature=require_signature,
            require_wet_signature=require_wet_signature,
            required_once=required_once
        )
        return company_document

    def create_another_user(self):
        user = UserFactory()
        CompanyUserFactory(user=user, company=self.company)
        return user

    def test_company_document_required_once_handling(self):
        user_2 = self.create_another_user()
        repetitive_document = self.create_company_document(required_once=False)
        company_acknowledge_document = self.create_company_document()
        company_signed_document = self.create_company_document(require_signature=True)
        company_wet_sign_document = self.create_company_document(require_signature=True, require_wet_signature=True)

        fund_1 = self.fund
        fund_2 = FundFactory(company=self.company, accept_applications=True)

        application_1 = self.get_application(fund=fund_1)
        application_2 = self.get_application(fund=fund_2)

        ApplicationFactory(company=self.company, user=user_2, fund=fund_1)
        ApplicationFactory(company=self.company, user=user_2, fund=fund_2)

        fund_1_documents_url = reverse('application-company-documents', kwargs={'fund_external_id': fund_1.external_id, 'skip_completed_required_docs': 'true'})
        fund_2_documents_url = reverse('application-company-documents', kwargs={'fund_external_id': fund_2.external_id, 'skip_completed_required_docs': 'true'})

        fund_1_response = self.client.get(fund_1_documents_url)
        self.assertEqual(fund_1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_1_response.data), 4)

        fund_2_response = self.client.get(fund_2_documents_url)
        self.assertEqual(fund_2_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_2_response.data), 4)

        ack_application_1_document = application_1.application_company_documents.get(
            company_document=company_acknowledge_document
        )

        wet_sign_application_1_document = application_1.application_company_documents.get(
            company_document=company_wet_sign_document
        )

        repetitive_application_1_document = application_1.application_company_documents.get(
            company_document=repetitive_document
        )

        update_url = reverse(
            'application-company-documents-update',
            kwargs={'fund_external_id': fund_1.external_id, 'pk': repetitive_application_1_document.id}
        )
        self.client.patch(update_url, data={'completed': True})
        und_2_response = self.client.get(fund_2_documents_url)
        self.assertEqual(fund_2_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_2_response.data), 4)

        fund_1_response = self.client.get(fund_1_documents_url)
        self.assertEqual(fund_1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_1_response.data), 4)


        update_url = reverse(
            'application-company-documents-update',
            kwargs={'fund_external_id': fund_1.external_id, 'pk': ack_application_1_document.id}
        )
        self.client.patch(update_url, data={'completed': True})

        fund_2_response = self.client.get(fund_2_documents_url)
        self.assertEqual(fund_2_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_2_response.data), 3)

        fund_1_response = self.client.get(fund_1_documents_url)
        self.assertEqual(fund_1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_1_response.data), 4)

        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload = {

            "completed": True,
            "file_data": origin_file_obj
        }

        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj

        update_url = reverse(
            'application-company-documents-update',
            kwargs={'fund_external_id': fund_1.external_id, 'pk': wet_sign_application_1_document.id}
        )
        self.client.patch(update_url, data=payload)

        fund_2_response = self.client.get(fund_2_documents_url)
        self.assertEqual(fund_2_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_2_response.data), 2)

        fund_1_response = self.client.get(fund_1_documents_url)
        self.assertEqual(fund_1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_1_response.data), 4)

        self.client.force_authenticate(user_2)
        fund_2_response = self.client.get(fund_2_documents_url)
        self.assertEqual(fund_2_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_2_response.data), 4)

        fund_1_response = self.client.get(fund_1_documents_url)
        self.assertEqual(fund_1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(fund_1_response.data), 4)


