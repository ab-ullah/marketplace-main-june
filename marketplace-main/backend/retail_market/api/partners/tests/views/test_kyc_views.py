from rest_framework import status
from rest_framework.reverse import reverse

from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.constants.headers import API_KEY_HEADER
from api.constants.kyc_investor_types import KYCInvestorType
from api.currencies.models import Currency
from api.documents.models import Document
from api.kyc_records.models import KYCRecord
from api.partners.constants import InvestorTypeEnum
from core.base_tests import BaseTestCase


class PartnerKYCDocumentViewsAPITestCase(BaseTestCase):

    def setUp(self):
        Document.objects.all().delete()
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )

        self.create_countries()
        self.create_card_workflow(company=self.company)

    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            API_KEY_HEADER: self.api_token,
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def test_create_kyc_record(self):
        url = reverse('kyc-record-create-api-view')
        payload = {
            'first_name': 'John',
            'last_name': 'smith',
            'email': 'testuser@gmail.com',
            'investor_account_code': 'investor-code',
            'investing_as': 'individual',
        }

        for i in range(2):
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(KYCRecord.objects.count(), 1)

            kyc_record = KYCRecord.objects.first()
            self.assertEqual(kyc_record.kyc_investor_type, KYCInvestorType.INDIVIDUAL.value)
            self.assertEqual(str(kyc_record.uuid), response.json()['sidecar_id'])

        payload['investing_as'] = 'trust'
        for i in range(2):
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(KYCRecord.objects.count(), 2)

            kyc_record = KYCRecord.objects.latest('created_at')
            self.assertEqual(kyc_record.kyc_investor_type, KYCInvestorType.TRUST.value)
            self.assertEqual(str(kyc_record.uuid), response.json()['sidecar_id'])
