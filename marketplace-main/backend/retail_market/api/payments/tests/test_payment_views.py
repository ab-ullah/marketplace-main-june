import json

from django.urls import reverse

from api.applications.models import Application
from api.applications.tests.factories import ApplicationFactory
from api.constants.kyc_investor_types import KYCInvestorType
from api.geographics.models import Country
from api.kyc_records.tests.factories import KYCRecordFactory
from core.base_tests import BaseTestCase


class TasksTestCase(BaseTestCase):

    def setUp(self):
        self.create_user()
        self.create_currency()
        self.setup_fund(self.company)
        self.client.force_authenticate(self.user)
        ApplicationFactory(
            fund=self.fund,
            company=self.company,
            user=self.user,
            kyc_record=KYCRecordFactory(
                user=self.user,
                company=self.company,
                company_user=self.company_user,
                kyc_investor_type=KYCInvestorType.INDIVIDUAL.value,
            )
        )

    def test_payment_detail_permission_denied(self):
        self.client.force_authenticate(None)
        url = reverse('payment-detail-list-create-api-view', kwargs={"fund_external_id": "fund_external_idf"})

        country = Country.objects.get(iso_code__iexact='US')

        payload = {
            "bank_name": "bank name", "street_address": "street address", "city": "city"
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 401)

    def test_payment_detail_invalid_fund_slug(self):
        url = reverse('payment-detail-list-create-api-view', kwargs={"fund_external_id": "test-fund"})

        country = Country.objects.get(iso_code__iexact='US')

        payload = {
            "bank_name": "bank name", "street_address": "street address", "city": "city",
            "postal_code": "postal code", "account_name": " account name", "account_number": "account number",
            "credit_account_name": "credit account name", "credit_account_number": "credit account number",
            "reference": "reference", "user": self.company_user.id, "bank_country": country.id,
            "currency": self.currency.id,
            "province": "bvn", "swift_code": "test swift_code", "iban_number": "test iban_number",
            "wires": "test wires", "have_intermediary_bank": True, "intermediary_bank_name": ""
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, 404)

    def test_payment_detail_missing_us_required_fields(self):
        url = reverse('payment-detail-list-create-api-view', kwargs={"fund_external_id": self.fund.external_id})

        country = Country.objects.get(iso_code__iexact='US')

        payload = {"bank_name": "bank name", "street_address": "street address", "city": "city",
                   "postal_code": "postal code", "account_name": " account name", "account_number": "account number",
                   "credit_account_name": "credit account name", "credit_account_number": "credit account number",
                   "reference": "reference", "user": self.user.id, "bank_country": country.id,
                   "currency": self.currency.id}

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(response.data.get('state'))
        self.assertTrue(response.data.get('routing_number'))

    def test_payment_detail_missing_non_us_required_fields(self):
        url = reverse('payment-detail-list-create-api-view', kwargs={"fund_external_id": self.fund.external_id})

        country = Country.objects.get(iso_code__iexact='AF')

        payload = {"bank_name": "bank name", "street_address": "street address", "city": "city",
                   "postal_code": "postal code", "account_name": " account name", "account_number": "account number",
                   "credit_account_name": "credit account name", "credit_account_number": "credit account number",
                   "reference": "reference", "user": self.user.id, "bank_country": country.id,
                   "currency": self.currency.id}

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(response.data.get('swift_code'))
        self.assertTrue(response.data.get('iban_number'))

        payload2 = {"bank_name": "bank name", "street_address": "street address", "city": "city",
                    "postal_code": "postal code", "account_name": " account name", "account_number": "account number",
                    "credit_account_name": "credit account name", "credit_account_number": "credit account number",
                    "reference": "reference", "user": self.user.id, "bank_country": country.id,
                    "currency": self.currency.id, "have_intermediary_bank": 1}

        response2 = self.client.post(
            url,
            data=json.dumps(payload2),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response2.status_code, 400)
        self.assertTrue(response2.data.get('swift_code'))
        self.assertTrue(response2.data.get('iban_number'))
        self.assertTrue(response2.data.get('intermediary_bank_name'))
        self.assertTrue(response2.data.get('intermediary_bank_swift_code'))

    def test_payment_detail_us_success(self):
        url = reverse('payment-detail-list-create-api-view', kwargs={"fund_external_id": self.fund.external_id})

        country = Country.objects.get(iso_code__iexact='US')

        bank_name = "Test Bank 1"
        payload = {"bank_name": bank_name, "street_address": "street address", "city": "city",
                   "postal_code": "postal code", "account_name": " account name", "account_number": "account number",
                   "credit_account_name": "credit account name", "credit_account_number": "credit account number",
                   "reference": "reference", "user": self.user.id, "bank_country": country.id,
                   "currency": self.currency.id,
                   "state": "state", "routing_number": "test routing_number", "ach": "test ach"
                   }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, 201)
        application = Application.objects.filter(
                user=self.user,
                fund__external_id=self.fund.external_id,
                company=self.company
            ).first()
        self.assertEqual(application.payment_detail.bank_name, bank_name)
        self.assertEqual(application.kyc_record.payment_detail.bank_name, bank_name)

    def test_payment_detail_non_us_success(self):
        url = reverse('payment-detail-list-create-api-view', kwargs={"fund_external_id": self.fund.external_id})

        country = Country.objects.get(iso_code__iexact='AF')

        payload = {
            "bank_name": "bank name", "street_address": "street address", "city": "city",
            "postal_code": "postal code", "account_name": " account name", "account_number": "account number",
            "credit_account_name": "credit account name", "credit_account_number": "credit account number",
            "reference": "reference", "user": self.user.id, "bank_country": country.id,
            "currency": self.currency.id, "province": "province", "iban_number": "iban_number",
            "swift_code": "swift_code",
            "wires": "test wires", "have_intermediary_bank": True, "intermediary_bank_name": "test",
            "intermediary_bank_swift_code": "test code"
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, 201)
