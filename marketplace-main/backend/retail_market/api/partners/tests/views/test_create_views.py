import io
import json
from copy import deepcopy
from datetime import timedelta
from unittest import mock

from decimal import Decimal

from dateutil.parser import parse as dt_parse
from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse

from api.activities.models import FundActivity, LoanActivity
from api.activities.tests.factories import FundActivityFactory, LoanActivityFactory
from api.agreements.models import FundAgreementDocument
from api.capital_calls.models import CapitalCall
from api.companies.models import CompanyUser
from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.constants.headers import API_KEY_HEADER
from api.currencies.models import Currency, CurrencyRate
from api.currencies.services.company_currency_details import CompanyCurrencyService
from api.documents.models import Document, FundDocument
from api.funds.models import Fund, FundNav
from api.investors.models import FundInvestor, Investor
from api.notifications.models import UserNotification
from api.partners.models import PartnerAPILog
from api.partners.tests.factories import InvestorFactory, FundFactory, CompanyUserInvestorFactory, CompanyUserFactory, \
    FundInvestorFactory, CompanyProfileFactory
from core.base_tests import BaseTestCase


class PartnerViewsAPITestCase(BaseTestCase):

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
        CompanyProfileFactory(company=self.company)
        Investor.objects.all().delete()
        FundInvestor.objects.all().delete()
        Fund.objects.all().delete()

    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            API_KEY_HEADER: self.api_token,
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def test_create_fund_400_view(self):
        url = reverse('partner-funds-create-api-view')

        payload = [
            {
                "id": "partner_fund_1",
                "name": "FundVI",
            }
        ]

        response = self.client.post(url, data=json.dumps(payload), content_type='application/json',
                                    **self.get_headers())

        log_query = PartnerAPILog.objects.filter(
            response_status=400
        )
        self.assertTrue(log_query.exists())
        log = log_query.get()
        self.assertEqual(
            log.request_body, payload
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_same_fund_id_different_name_code(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_1",
                "investment_product_code": "123456",
                "name": "FundVI",
                "business_line": "Europe Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        log_query = PartnerAPILog.objects.filter(
            response_status=201
        )
        self.assertTrue(log_query.exists())
        log = log_query.get()
        self.assertEqual(log.request_body, payload)

        payload = [
            {
                "id": "partner_fund_2",
                "investment_product_code": "6543",
                "name": "FundVI",
                "business_line": "Europe Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0]['non_field_errors'][0],
            'Please make sure that fund has unique name, id and investment_product_code'
        )

        log_query = PartnerAPILog.objects.filter(
            response_status=400
        )
        self.assertTrue(log_query.exists())
        log = log_query.get()
        self.assertEqual(log.request_body, payload)

        payload = [
            {
                "id": "partner_fund_2",
                "investment_product_code": "123456",
                "name": "FundVII",
                "business_line": "Europe Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0]['non_field_errors'][0],
            'Please make sure that fund has unique name, id and investment_product_code'
        )

    def test_create_fund_longer_product_code_view(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_1",
                "investment_product_code": "1234a",
                "name": "FundVI A",
                "business_line": "Europe  PriVate",
                "fund_type": "Open",
                "currency": "USD"
            },
            {
                "id": "partner_fund_2",
                "investment_product_code": "1234b",
                "name": "FundVI B",
                "business_line": "Europe  PriVate",
                "fund_type": "Open",
                "currency": "USD"
            },
        ]

        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 2)

        fund = Fund.objects.earliest('created_at')
        self.assertEqual(fund.investment_product_code, '1234a')
        self.assertEqual(fund.raw_investment_product_code, '1234a')
        self.assertEqual(fund.vehicle_code, '')
        self.assertEqual(fund.fund_currency_id, self.base_currency.id)
        self.assertEqual(fund.fund_type, Fund.FundTypeChoice.OPEN.value)
        self.assertEqual(fund.business_line, Fund.BusinessLineChoice.EUROPE_PRIVATE.value)
        self.assertTrue(fund.created_via_partner_api)

        fund = Fund.objects.latest('created_at')
        self.assertEqual(fund.investment_product_code, '1234b')
        self.assertEqual(fund.vehicle_code, '')

    def test_create_fund_view(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_1",
                "investment_product_code": "123456",
                "vehicle_code": "6",
                "name": "FundVI",
                "business_line": "Europe  PriVate",
                "fund_type": "Open",
                "currency": "USD"
            },
            {
                "id": "partner_fund_2",
                "investment_product_code": "6543a",
                "name": "FundVII",
                "business_line": "EurOpe  Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]

        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 2)

        # On same request fund should be updated instead of getting created again
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 2)

        fund = Fund.objects.earliest('created_at')
        self.assertEqual(fund.investment_product_code, '123456')
        self.assertEqual(fund.raw_investment_product_code, '123456')
        self.assertEqual(fund.vehicle_code, '6')
        self.assertEqual(fund.fund_currency_id, self.base_currency.id)
        self.assertEqual(fund.fund_type, Fund.FundTypeChoice.OPEN.value)
        self.assertEqual(fund.business_line, Fund.BusinessLineChoice.EUROPE_PRIVATE.value)
        self.assertEqual(fund.is_legacy, False)
        self.assertTrue(fund.created_via_partner_api)

        fund = Fund.objects.latest('created_at')
        self.assertEqual(fund.investment_product_code, '6543a')
        self.assertEqual(fund.vehicle_code, '')

    def test_create_legacy_fund_view(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_3",
                "investment_product_code": "2234d56",
                "vehicle_code": "56",
                "name": "FundVII",
                "business_line": "Europe  PriVate",
                "fund_type": "Open",
                "currency": "USD",
                "legacy_import": True,
            },
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 1)

        fund = Fund.objects.earliest('created_at')
        self.assertEqual(fund.investment_product_code, '2234d56')
        self.assertEqual(fund.raw_investment_product_code, '2234d56')
        self.assertEqual(fund.vehicle_code, '56')
        self.assertEqual(fund.fund_currency_id, self.base_currency.id)
        self.assertEqual(fund.fund_type, Fund.FundTypeChoice.OPEN.value)
        self.assertEqual(fund.business_line, Fund.BusinessLineChoice.EUROPE_PRIVATE.value)
        self.assertEqual(fund.is_legacy, True)

    def test_create_fund_with_display_name(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_3",
                "investment_product_code": "2234d56",
                "vehicle_code": "56",
                "name": "Global Employee CoInvestment LP B (FUNDVII)",
                "business_line": "Europe  PriVate",
                "fund_type": "Open",
                "currency": "USD",
                "display_name": "FundVII"
            },
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 1)

        fund = Fund.objects.earliest('created_at')
        self.assertEqual(fund.investment_product_code, '2234d56')
        self.assertEqual(fund.raw_investment_product_code, '2234d56')
        self.assertEqual(fund.vehicle_code, '56')
        self.assertEqual(fund.fund_currency_id, self.base_currency.id)
        self.assertEqual(fund.fund_type, Fund.FundTypeChoice.OPEN.value)
        self.assertEqual(fund.business_line, Fund.BusinessLineChoice.EUROPE_PRIVATE.value)
        self.assertEqual(fund.display_name, "FundVII")
        self.assertEqual(fund.name, "Global Employee CoInvestment LP B (FUNDVII)")


    def test_currencies_view(self):
        CurrencyRate.objects.all().delete()
        url = reverse('funds-currency-rate-create-api-view')
        payload = [{"from": "GBP", "to": "USD"}]
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json',
                                    **self.get_headers())

        payload = [{"from": "YYY", "to": "USD"}]
        response = self.client.post(url, data=json.dumps(payload), content_type='application/json',
                                    **self.get_headers())

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        gbp_currency = Currency.objects.get(company=self.company, code='GBP')
        usd_currency = Currency.objects.get(company=self.company, code='USD')

        for idx, rate in enumerate([4.5, 9.7, 11.8]):
            transaction_date = timezone.now()
            payload = [
                {
                    "from": "GBP",
                    "to": "USD",
                    "rate": rate,
                    "transaction_date": str(transaction_date)
                }
            ]

            response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

            response = self.client.post(
                url,
                data=json.dumps(payload),
                content_type='application/json',
                **self.get_headers()
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            self.assertEqual(CurrencyRate.objects.count(), idx + 1)

            currency_service = CompanyCurrencyService(company=self.company)
            currency_detail = currency_service.get_cache()
            self.assertEqual(currency_detail[gbp_currency.id]['rate'], rate)
            self.assertEqual(currency_detail[usd_currency.id]['rate'], 1)

            aud_detail = currency_service.get_currency_detail(gbp_currency.id)
            self.assertEqual(aud_detail['rate'], rate)

            usd_detail = currency_service.get_currency_detail(usd_currency.id)
            self.assertEqual(usd_detail['rate'], 1)

            currency_rate = CurrencyRate.objects.latest('created_at')  # type: CurrencyRate
            self.assertEqual(currency_rate.conversion_rate, rate)
            self.assertEqual(currency_rate.rate_date, transaction_date)

    def test_fund_documents_view_unauthorized(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_1",
                "investment_product_code": "partner_fund_code_1",
                "name": "FundVI",
                "business_line": "Europe Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]

        response = self.client.post(url, data=json.dumps(payload), content_type='application/json',
                                    **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        url = reverse('funds-document-create-api-view')
        content_type = "application/text"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'fund_id': 'partner_fund_1',
            'file_title': 'temp_file',
            'file_content_type': content_type,
            'file_type': 'application/text',
            'file_data': origin_file_obj
        }

        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_fund_documents_view(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_1",
                "investment_product_code": "partner_fund_code_1",
                "name": "FundVI",
                "business_line": "Europe Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        fund = Fund.objects.first()

        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)

        investor_2 = InvestorFactory()
        company_user_2 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_2)
        FundInvestorFactory(fund=fund, investor=investor_2)

        notifications = ['agreement', 'pitchbook']
        mapped_notifications_type = [
            UserNotification.NotificationTypeChoice.AGREEMENT.value,
            UserNotification.NotificationTypeChoice.PITCH_BOOK.value
        ]
        mapped_document_type = [
            Document.DocumentType.AGREEMENT.value,
            Document.DocumentType.PITCH_BOOK.value
        ]

        fund.publish_investment_details = True
        fund.save()

        for i in range(0, 2):
            url = reverse('funds-document-create-api-view')
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'funddoc-{}'.format(i),
                'fund_id': 'partner_fund_1',
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_data': origin_file_obj,
                'skip_notification': False,
                'file_type': notifications[i],
                "file_date": str(timezone.now().date())
            }

            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            log = PartnerAPILog.objects.filter(
                response_status=201,
            ).latest('created_at')
            data = deepcopy(payload)
            del data['file_data']
            self.assertEqual(log.request_body['fund_id'], data['fund_id'])
            self.assertEqual(log.request_body['file_name'], data['file_name'])
            self.assertEqual(log.request_body['file_date'], data['file_date'])


            document = Document.objects.latest('created_at')
            self.assertEqual(document.title, payload['file_name'])
            self.assertEqual(document.document_type, mapped_document_type[i])
            self.assertEqual(document.extension, 'txt')
            self.assertEqual(document.content_type, content_type)
            self.assertIsNotNone(document.document_path)

            fund_document_count = FundDocument.objects.filter(fund=fund, document=document).count()
            # There will only be one document for this fund, regardless of loop count.
            self.assertEqual(fund_document_count, 1)

            self.assertEqual(company_user_1.company_user_notifications.count(), i + 1)
            notification_1 = company_user_1.company_user_notifications.latest('created_at')
            self.assertEqual(notification_1.notification_type, mapped_notifications_type[i])

            self.assertEqual(company_user_2.company_user_notifications.count(), i + 1)
            notification_2 = company_user_2.company_user_notifications.latest('created_at')
            self.assertEqual(notification_2.notification_type, mapped_notifications_type[i])

            self.assertNotEqual(notification_2.id, notification_1.id)

        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_2",
                "investment_product_code": "partner_fund_code_2",
                "name": "FundV",
                "business_line": "Europe Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]
        self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        fund = Fund.objects.get(partner_id=payload[0]['id'])
        fund.publish_investment_details = True
        fund.save()

        url = reverse('funds-document-create-api-view')
        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'funddoc-0',
            'fund_id': 'partner_fund_2',
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': "agreement",
            "file_date": str(timezone.now().date())
        }

        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'Document with id: funddoc-0 already assigned to another fund'
        )

    def test_fund_document_require_acknowledgement_update_handling(self):
        fund = FundFactory(
            company=self.company,
            partner_id="partner_fund_1",
            investment_product_code="partner_fund_code_1",
        )

        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)

        fund.publish_investment_details = True
        fund.save()

        for i in range(0, 2):
            url = reverse('funds-document-create-api-view')
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'funddoc-{1}',
                'fund_id': 'partner_fund_1',
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_data': origin_file_obj,
                'skip_notification': False,
                'file_type': 'agreement',
                "file_date": str(timezone.now().date())
            }

            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            document = Document.objects.get(partner_id='funddoc-{1}')
            self.assertEqual(document.title, payload['file_name'])
            self.assertEqual(document.document_type, Document.DocumentType.AGREEMENT.value)
            self.assertEqual(document.extension, 'txt')
            self.assertEqual(document.content_type, content_type)
            self.assertIsNotNone(document.document_path)

            fund_document_count = FundDocument.objects.filter(fund=fund, document=document).count()
            # There will only be one document for this fund, regardless of loop count.
            self.assertEqual(fund_document_count, 1)

            fund_document = FundDocument.objects.filter(fund=fund, document=document).get()

            if i == 0:
                self.assertFalse(fund_document.require_acknowledgement)

            # Setting this to true so that we can check changing this does not break the API
            fund_document.require_acknowledgement = True
            fund_document.save()

            self.assertEqual(company_user_1.company_user_notifications.count(), 1)
            notification_1 = company_user_1.company_user_notifications.latest('created_at')
            self.assertEqual(notification_1.notification_type, UserNotification.NotificationTypeChoice.AGREEMENT.value)

    def test_fund_documents_unpublished_fund(self):
        fund = FundFactory(company=self.company)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)

        investor_2 = InvestorFactory()
        company_user_2 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_2)
        FundInvestorFactory(fund=fund, investor=investor_2)

        url = reverse('funds-document-create-api-view')
        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'funddoc-01',
            'fund_id': fund.partner_id,
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': 'agreement',
            "file_date": str(timezone.now().date())
        }

        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'skip_notification must be true for unpublished funds'
        )

    def test_fund_documents_unpublished_fund_all_file_types(self):
        fund = FundFactory(company=self.company)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)

        investor_2 = InvestorFactory()
        company_user_2 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_2)
        FundInvestorFactory(fund=fund, investor=investor_2)

        url = reverse('funds-document-create-api-view')

        for ftype in ["financial-information",
                      "property-portfolio",
                      "quarterly-report",
                      "ethics",
                      "investor-meeting-materials",
                      "strategic-materials",
                      "sustainability",
                      "annual-report",
                      "monthly-report",
                      ]:
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)
            payload = {
                'id': "fund-doc-{}".format(ftype),
                'fund_id': fund.partner_id,
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_data': origin_file_obj,
                'skip_notification': True,
                'file_type': ftype,
                "file_date": str(timezone.now().date())
            }

            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fund_documents_fund_not_found(self):
        fund = FundFactory(company=self.company)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)

        investor_2 = InvestorFactory()
        company_user_2 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_2)
        FundInvestorFactory(fund=fund, investor=investor_2)

        url = reverse('funds-document-create-api-view')
        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'funddoc-01',
            'fund_id': 'garbage',
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': 'agreement',
            "file_date": str(timezone.now().date())
        }

        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'No fund found with partner id: {}'.format(payload['fund_id'])
        )

    def test_fund_onboarding_fund_aggrement(self):
        url = reverse("funds-on-boarding-create-api-view")
        fund = FundFactory(company=self.company)
        contents = b"Ready to be signed, counter-signed and invested!"
        content_type = "application/pdf"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': "{}-sub-doc".format(fund.slug),
            'fund_slug': fund.slug,
            'file_name': 'Subscription Agreement',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'file_type': 'fund-agreement-documents',
        }

        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        document = Document.objects.latest('created_at')
        self.assertEqual(document.title, payload['file_name'])
        self.assertEqual(document.extension, 'pdf')
        self.assertEqual(document.content_type, content_type)
        self.assertEqual(document.document_type, Document.DocumentType.FUND_AGREEMENT_DOCUMENT)
        self.assertIsNotNone(document.document_path)

        fundagreement = FundAgreementDocument.objects.latest('created_at')
        self.assertEqual(fundagreement.fund.id, fund.id)
        self.assertEqual(fundagreement.company.id, self.company.id)
        self.assertEqual(fundagreement.document.id, document.id)

    @mock.patch('api.partners.services.create_notification.async_task')
    def test_fund_document_capital_call(self, mock_email_send):
        fund = FundFactory(company=self.company, publish_investment_details=True)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)

        for i in range(0, 2):
            url = reverse('funds-document-create-api-view')
            content_type = "application/pdf"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'funddoc01',
                'fund_id': fund.partner_id,
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_data': origin_file_obj,
                'skip_notification': False,
                'file_type': 'capital-call',
                'file_date': str(timezone.now().date()),
                'due_date': str(timezone.now().date())
            }

            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            document = Document.objects.latest('created_at')
            self.assertEqual(document.title, payload['file_name'])
            self.assertEqual(document.extension, 'pdf')
            self.assertEqual(document.content_type, content_type)
            self.assertEqual(document.document_type, Document.DocumentType.CAPITAL_CALL.value)
            self.assertIsNotNone(document.document_path)

            fund_document_count = FundDocument.objects.filter(fund=fund, document=document).count()
            self.assertEqual(fund_document_count, 1)

            self.assertEqual(company_user_1.company_user_notifications.count(), 1)
            notification_1 = company_user_1.company_user_notifications.latest('created_at')
            self.assertEqual(
                notification_1.notification_type,
                UserNotification.NotificationTypeChoice.CAPITAL_CALL.value
            )

            capital_calls = CapitalCall.objects.filter(fund=fund).count()
            self.assertEqual(capital_calls, 1)

        self.assertEqual(mock_email_send.call_count, 1)

    def test_create_fund_activity_view(self):
        url = reverse('funds-activity-create-api-view')
        payload = [
            {
                "transaction_date": str(timezone.now()),
                "investor_account_code": "investor_01",
                "investment_product_code": "1234d56",
                "share_class": "d",
                "commitment_amount": 9000,
                "outstanding_commitment": 4000,
                "income_distributions": 500,
                "leveraged_irr": 40,
                "unleveraged_irr": 60,
                "current_leverage_rate": 25,
                "initial_leverage_rate": 20,
                "current_interest_rate": 12,
                "fund_ownership": 150.12345678,
                "capital_called_since_last_nav": 2000,
                "unrealized_gain_loss": 1000,
                "called_to_date": "1234567890.12345678",
                "gain_loss": 4000,
                "distributions_since_inception": 1500,
                "distributions_since_last_nav": 1500,
                "profit_distributions": 11000,
                "return_of_capital": 12000
            }
        ]

        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0]['non_field_errors'][0],
            'No fund found with code: {}'.format(payload[0]['investment_product_code'])
        )

        FundFactory(investment_product_code=payload[0]['investment_product_code'],
                    company=self.company)
        InvestorFactory(investor_account_code=payload[0]['investor_account_code'])

        for i in range(0, 2):
            response = self.client.post(
                url,
                data=json.dumps(payload),
                content_type='application/json',
                **self.get_headers()
            )

            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            activity_count = FundActivity.objects.count()
            self.assertEqual(activity_count, 1)

            activity = FundActivity.objects.first()
            for field, value in payload[0].items():
                if field == 'investment_product_code' or field == 'called_to_date':
                    continue
                if field == 'transaction_date':
                    value = dt_parse(value)
                self.assertEqual(getattr(activity, field), value)

            self.assertEqual(activity.raw_investment_product_code, '1234d56')
            self.assertEqual(activity.investment_product_code, '1234d56')
            self.assertEqual(activity.share_class, 'd')
            expected_value = Decimal('1234567890.12345678')
            self.assertEqual(activity.called_to_date, expected_value)
            fund_investor_count = FundInvestor.objects.count()
            self.assertEqual(fund_investor_count, 0)

    def test_create_fund_activity_with_no_loan_creates_fund_investor(self):
        url = reverse('funds-activity-create-api-view')
        transaction_date = timezone.now() + timedelta(days=1)
        payload = [
            {
                "transaction_date": str(transaction_date),
                "investor_account_code": "investor_01",
                "investment_product_code": "INVS",
                "commitment_amount": 9000,
                "outstanding_commitment": 4000,
                "income_distributions": 500,
                "leveraged_irr": 40,
                "unleveraged_irr": 60,
                "distributions_since_last_nav": 2000,
                "current_leverage_rate": 25,
                "initial_leverage_rate": 0,
                "current_interest_rate": 12,
                "fund_ownership": 153.87654321,
                "capital_called_since_last_nav": 2000,
                "unrealized_gain_loss": 1000,
                "called_to_date": 2000,
                "gain_loss": 4000,
                "equity_commitment": 300.22789,
                "equity_called_to_date": 200,
            }
        ]
        FundFactory(investment_product_code=payload[0]['investment_product_code'], company=self.company)
        InvestorFactory(investor_account_code=payload[0]['investor_account_code'])
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        activity_count = FundActivity.objects.count()
        self.assertEqual(activity_count, 1)

        fund_investor_count = FundInvestor.objects.count()
        self.assertEqual(fund_investor_count, 1)

        fund_investor = FundInvestor.objects.first()
        self.assertEqual(fund_investor.loan_commitment, 0)
        self.assertEqual(fund_investor.loan_balance, 0)
        self.assertEqual(fund_investor.interest_paid, 0)
        self.assertEqual(fund_investor.loan_balance_with_unpaid_interest, 0)
        self.assertEqual(fund_investor.fund_ownership_percent, 153.87654321)
        self.assertEqual(fund_investor.equity_commitment, Decimal("300.22789"))  # Values not rounded
        self.assertEqual(fund_investor.latest_transaction_date, transaction_date)

    def test_create_loan_activity_view(self):
        url = reverse('loans-activity-create-api-view')
        payload = [
            {
                "transaction_date": str(timezone.now()),
                "share_class": "a",
                "investor_account_code": "investor_01",
                "investment_product_code": "1234d5678",
                "loan_commitment": 1000,
                "loan_balance": 200,
                "interest_paid_to_date": 900,
                "interest_balance": 400,
                "interest_repay_income": 500,
                "interest_repay_capital": 200,
                "loan_drawn": 6000,
                "loan_repayment": 3500,
            }
        ]

        response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        FundFactory(
            investment_product_code=payload[0]['investment_product_code'],
            company=self.company
        )
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0]['non_field_errors'][0],
            'No investor found with code: {}'.format(payload[0]['investor_account_code'])
        )

        InvestorFactory(investor_account_code=payload[0]['investor_account_code'])

        for i in range(0, 2):
            response = self.client.post(
                url,
                data=json.dumps(payload),
                content_type='application/json',
                **self.get_headers()
            )

            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            activity_count = LoanActivity.objects.count()
            self.assertEqual(activity_count, 1)

            activity = LoanActivity.objects.first()
            for field, value in payload[0].items():
                if field == 'investment_product_code':
                    continue

                if field == 'transaction_date':
                    value = dt_parse(value)
                self.assertEqual(getattr(activity, field), value)

            self.assertEqual(activity.raw_investment_product_code, '1234d5678')
            self.assertEqual(activity.investment_product_code, '1234d5678')
            self.assertEqual(activity.share_class, 'a')
            self.assertIsNone(activity.leverage_ratio)

    def test_fund_name_change_view(self):
        url = reverse('partner-funds-create-api-view')
        initial_name = "Co-Invest Fund C"
        new_name = "Employee Co-Invest Flagship"
        partner_id = "c08c0550-88d5-4e35-ac7d-9ccc14aebb15"
        payload = [
            {
                "business_line": "Americas Private",
                "currency": "USD",
                "fund_type": "Closed",
                "id": partner_id,
                "investment_product_code": "za06ab41",
                "name": initial_name
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload[0]["name"] = new_name
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        fund = Fund.objects.get(partner_id=partner_id)
        self.assertEqual(fund.name, new_name)

    def test_fund_nav_view(self):
        url = reverse('partner-funds-create-api-view')
        payload = [
            {
                "id": "partner_fund_1",
                "investment_product_code": "partner_fund_code_1",
                "name": "FundVI",
                "business_line": "Europe Private",
                "fund_type": "Open",
                "currency": "USD"
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        fund = Fund.objects.get(partner_id='partner_fund_1')

        url = reverse('funds-nav-create-api-view')

        for i in range(1, 4):
            payload = {
                "fund_id": "partner_fund_1",
                "as_of": str(timezone.now().date()),
                "nav": 1000 * i
            }
            response = self.client.post(
                url,
                data=json.dumps(payload),
                content_type='application/json',
                **self.get_headers()
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(FundNav.objects.count(), 1)
            fund_nav = FundNav.objects.filter(fund=fund).first()
            self.assertEqual(fund_nav.nav, 1000 * i)
            self.assertEqual(fund_nav.as_of, dt_parse(payload['as_of']).date())

        fund_2 = FundFactory(company=self.company)
        payload = {
            "fund_id": fund_2.partner_id,
            "as_of": str(timezone.now().date()),
            "nav": 2000
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FundNav.objects.count(), 2)
        fund_nav = FundNav.objects.filter(fund=fund_2).first()
        self.assertEqual(fund_nav.nav, 2000)

        fund_nav = FundNav.objects.filter(fund=fund).first()
        self.assertEqual(fund_nav.nav, 3000)

    def test_regeneration_api_validation(self):
        investment_product_code = 'test-investment-product-code'
        investor_account_code = 'test-investor-account-code'

        fund = FundFactory(company=self.company, investment_product_code=investment_product_code)
        investor = InvestorFactory(investor_account_code=investor_account_code)

        url = reverse('funds-activity-regenerate-api-view')
        payload = {
            'investor_account_code': investor_account_code,
            'investment_product_code': investment_product_code
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'No fund activity found for account code/product code combination'
        )

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=investment_product_code,
            investor_account_code=investor_account_code,
            initial_leverage_rate=0,
            gross_share_of_nav=200,
            capital_called_since_last_nav=50,
            distributions_since_last_nav=70,
        )

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'No loan activity found for account code/product code combination'
        )

    def test_fund_activity_regeneration_fund_investor_recreated(self):
        investment_product_code = 'test-investment-product-code'
        investor_account_code = 'test-investor-account-code'

        fund = FundFactory(company=self.company, investment_product_code=investment_product_code)
        investor = InvestorFactory(investor_account_code=investor_account_code)

        self.assertEqual(FundInvestor.objects.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=investment_product_code,
            investor_account_code=investor_account_code,
            initial_leverage_rate=0,
            gross_share_of_nav=200,
            capital_called_since_last_nav=50,
            distributions_since_last_nav=70,
        )

        loan_activity = LoanActivityFactory(
            transaction_date=timezone.now() + timedelta(days=3),
            company=self.company,
            investment_product_code=investment_product_code,
            investor_account_code=investor_account_code,
            loan_balance=50,
            interest_balance=100,
            interest_paid_to_date=300,
            loan_drawn=6000,
            loan_repayment=3500,
        )

        self.assertEqual(FundInvestor.objects.count(), 1)

        FundInvestor.objects.all().delete()

        url = reverse('funds-activity-regenerate-api-view')
        payload = {
            'investor_account_code': investor_account_code,
            'investment_product_code': investment_product_code
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FundActivity.objects.count(), 1)
        self.assertEqual(LoanActivity.objects.count(), 1)
        self.assertEqual(FundInvestor.objects.count(), 1)

    def test_fund_activity_regeneration_values_updated(self):
        investment_product_code = 'test-investment-product-code'
        investor_account_code = 'test-investor-account-code'

        fund = FundFactory(company=self.company, investment_product_code=investment_product_code)
        investor = InvestorFactory(investor_account_code=investor_account_code)

        self.assertEqual(FundInvestor.objects.count(), 0)

        transaction_date = timezone.now() + timedelta(days=3)
        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=investment_product_code,
            investor_account_code=investor_account_code,
            initial_leverage_rate=0,
            gross_share_of_nav=200,
            capital_called_since_last_nav=50,
            distributions_since_last_nav=70,
            transaction_date=transaction_date
        )

        loan_activity = LoanActivityFactory(
            transaction_date=transaction_date,
            company=self.company,
            investment_product_code=investment_product_code,
            investor_account_code=investor_account_code,
            loan_balance=50,
            interest_balance=100,
            interest_paid_to_date=300,
            loan_drawn=6000,
            loan_repayment=3500,
        )

        self.assertEqual(FundInvestor.objects.count(), 1)

        fund_investor = FundInvestor.objects.first()  # type: FundInvestor
        self.assertEqual(fund_investor.capital_calls_since_last_nav, fund_activity.capital_called_since_last_nav)
        self.assertEqual(fund_investor.gross_share_of_investment_product, fund_activity.gross_share_of_nav)
        self.assertEqual(fund_investor.loan_repayment, loan_activity.loan_repayment)
        self.assertEqual(fund_investor.interest_paid, loan_activity.interest_paid_to_date)

        fund_investor.capital_calls_since_last_nav = 999
        fund_investor.gross_share_of_investment_product = 888
        fund_investor.loan_repayment = 777
        fund_investor.interest_paid = 666
        fund_investor.save()

        fund_investor.refresh_from_db()

        self.assertNotEqual(fund_investor.capital_calls_since_last_nav, fund_activity.capital_called_since_last_nav)
        self.assertNotEqual(fund_investor.gross_share_of_investment_product, fund_activity.gross_share_of_nav)
        self.assertNotEqual(fund_investor.loan_repayment, loan_activity.loan_repayment)
        self.assertNotEqual(fund_investor.interest_paid, loan_activity.interest_paid_to_date)

        url = reverse('funds-activity-regenerate-api-view')
        payload = {
            'investor_account_code': investor_account_code,
            'investment_product_code': investment_product_code
        }

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FundActivity.objects.count(), 1)
        self.assertEqual(LoanActivity.objects.count(), 1)
        self.assertEqual(FundInvestor.objects.count(), 1)

        fund_investor = FundInvestor.objects.first()  # type: FundInvestor
        self.assertEqual(fund_investor.capital_calls_since_last_nav, fund_activity.capital_called_since_last_nav)
        self.assertEqual(fund_investor.gross_share_of_investment_product, fund_activity.gross_share_of_nav)
        self.assertEqual(fund_investor.loan_repayment, loan_activity.loan_repayment)
        self.assertEqual(fund_investor.interest_paid, loan_activity.interest_paid_to_date)

    @mock.patch('api.partners.services.create_notification.DocumentNotificationService.create_notification')
    def test_multiple_company_user_notification_count(self, mock_create_notification):
        fund = FundFactory(company=self.company, publish_investment_details=True)
        investor_1 = InvestorFactory()
        investor_2 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)
        FundInvestorFactory(fund=fund, investor=investor_2)

        url = reverse('funds-document-create-api-view')
        content_type = "application/pdf"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'funddoc01-investor-1',
            'fund_id': fund.partner_id,
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': 'prospectus',
            'file_date': str(timezone.now().date()),
            'due_date': str(timezone.now().date())
        }
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(mock_create_notification.call_count, 1)
