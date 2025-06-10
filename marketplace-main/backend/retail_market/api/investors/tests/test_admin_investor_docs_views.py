import io

from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse

from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService, DUMMY_COMPANY_NAME
from api.documents.models import Document, FundDocument, InvestorDocument
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import FundFactory, AdminUserFactory, UserFactory, InvestorFactory, \
    CompanyUserFactory, CompanyUserInvestorFactory, FundInvestorFactory
from core.base_tests import BaseTestCase


class AdminCompanyDocumentsUploadAPITestCase(BaseTestCase):

    def setUp(self):
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.company = company_info['company']
        self.admin_user = AdminUserFactory(
            company=self.company,
            user=UserFactory()
        )
        self.client.force_authenticate(self.admin_user.user)

    def test_admin_fund_document_upload_by_external_id(self):
        fund = FundFactory(
            company=self.company
        )
        fund.publish_investment_details = True
        fund.save()

        url = reverse('create-fund-document')

        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'fund-doc-1',
            'fund_external_id': fund.external_id,
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': 'agreement',
            "file_date": str(timezone.now().date())
        }

        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        document = Document.objects.latest('created_at')
        self.assertEqual(document.title, payload['file_name'])
        self.assertEqual(document.extension, 'txt')
        self.assertEqual(document.content_type, content_type)

        # check with wrong fund external id
        payload['fund_external_id'] = 'random-id'
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # check without fund external id
        payload.pop('fund_external_id')
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_investor_fund_document_upload_by_external_id(self):
        fund = FundFactory(
            company=self.company
        )
        fund.publish_investment_details = True
        fund.save()

        investor = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)
        CompanyUserInvestorFactory(investor=investor, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor)

        url = reverse('create-investor-document')

        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'fund-doc-x-1',
            'fund_external_id': fund.external_id,
            'file_name': 'investor_x_doc',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': 'agreement',
            "file_date": str(timezone.now().date()),
            'parse_file_name': False,
            'investor_vehicle_id': investor.partner_id,
        }

        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        document = Document.objects.latest('created_at')
        self.assertEqual(document.title, 'investor_x_doc')
        self.assertEqual(document.extension, 'txt')
        self.assertEqual(document.content_type, content_type)

        # check with wrong fund external id
        payload['fund_external_id'] = 'random-id'
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # check without fund external id
        payload.pop('fund_external_id')
        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class InvestorDocumentsListViewTestCase(BaseTestCase):

    def setUp(self):
        company_info = CompanyService.create_company(company_name=DUMMY_COMPANY_NAME)
        self.company = company_info['company']
        self.admin_user = AdminUserFactory(
            company=self.company,
            user=UserFactory()
        )
        self.user = self.admin_user.user
        self.company_user = CompanyUserFactory(
            company=self.company,
            user=self.user
        )
        self.client.force_authenticate(self.admin_user.user)

    def test_wrong_param_in_ordering(self):
        fund = FundFactory(company=self.company)
        investor = InvestorFactory()
        CompanyUserInvestorFactory(
            investor=investor,
            company_user=self.company_user
        )
        document = DocumentFactory(
            company=self.company,
            uploaded_by_user=self.company_user,
            title='Test Document'
        )
        investor_document = InvestorDocument.objects.create(
            document=document,
            investor=investor
        )

        url = reverse('list-investor-documents')

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], document.title)

        response = self.client.get(url, data={'ordering': 'undefined'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
