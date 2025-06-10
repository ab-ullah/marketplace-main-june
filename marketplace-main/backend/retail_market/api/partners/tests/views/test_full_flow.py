import io
import json
import datetime
from decimal import Decimal

from unittest import mock

from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.activities.models import LoanActivity, FundActivity, TransactionDetail
from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.companies.services.company_service import CompanyService, DUMMY_COMPANY_NAME
from api.constants.headers import API_KEY_HEADER
from api.currencies.models import Currency
from api.documents.models import Document
from api.funds.models import Fund, FundNav
from api.investors.models import Investor, FundInvestor

from api.notifications.models import UserNotification
from api.users.models import RetailUser
from api.partners.tests.factories import UserFactory, CompanyProfileFactory, FundFactory, \
    InvestorFactory


class PartnerAPIFullFlowTestCase(APITestCase):

    def setUp(self):
        # Have to delete the users because of user created in data migration
        RetailUser.objects.all().delete()
        Document.objects.all().delete()
        Investor.objects.all().delete()
        FundInvestor.objects.all().delete()
        Fund.objects.all().delete()
        company_info = CompanyService.create_company(company_name=DUMMY_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )
        self.user = UserFactory()
        CreateAdminUserService(email=self.user.email, company_name=self.company.name).create()
        CompanyProfileFactory(company=self.company)

    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            API_KEY_HEADER: self.api_token,
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    @mock.patch('api.libs.sendgrid.email.SendEmailService._send')
    def test_negative_gross_share_nav(self, mock_email_send):
        url = reverse('partner-funds-create-api-view')

        funds_payload = [
            {
                "id": "fund-1",
                "investment_product_code": "1234d56",
                "name": "LaSalle Asia Opportunity Fund 6",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            },
            {
                "id": "fund-2",
                "investment_product_code": "5678d",
                "name": "LRES IV",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(funds_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 2)

        investors_payload = [
            {
                "id": "i01",
                "preferred_user_name": "user1@test.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "io1-v01",
                        "investor_account_code": "io1-code-v01",
                        "name": "Inv 01",
                        "vehicle_type": "individual"
                    }
                ]
            },
            {
                "id": "i02",
                "preferred_user_name": "user2@hellosidecar.com",
                "first_name": "Michael",
                "last_name": "Flip",
                "investment_vehicles": [
                    {
                        "id": "io2-v01",
                        "investor_account_code": "io2-code-v01",
                        "name": "Inv 02",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]
        url = reverse('investment-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(investors_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        users_count = RetailUser.objects.count()
        self.assertEqual(users_count, 3)  # three because of the admin user
        investors_count = Investor.objects.count()
        self.assertEqual(investors_count, 2)

        fund_activities_payload = [
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "commitment_amount": 100000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": -1625.139,
                "called_to_date": 0,
                "gross_share_of_nav": -1625.139
            }
        ]

        url = reverse('funds-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        fund_activities_count = FundActivity.objects.count()
        self.assertEqual(fund_activities_count, 1)
        fund_activities_latest = FundActivity.objects.latest('transaction_date')

        loan_activities_payload = [
            {
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "transaction_date": "2020-09-29T00:00",
                "currency": "USD",
                "loan_commitment": 50000,
                "loan_balance": 50000,
                "interest_balance": 0,
                "interest_repay_income": 0,
                "interest_repay_capital": 0,
            }
        ]

        url = reverse('loans-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(loan_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        loan_activities_count = LoanActivity.objects.count()
        loan_activities_latest = LoanActivity.objects.latest('transaction_date')
        self.assertEqual(loan_activities_count, 1)

        fund_investors_qs = FundInvestor.objects.all()
        self.assertEqual(fund_investors_qs.count(), 1)

        fund_investor = fund_investors_qs.first()
        self.assertEqual(fund_investor.currency_id, self.base_currency.id)
        self.assertEqual(fund_investor.loan_commitment, loan_activities_latest.loan_commitment)
        self.assertEqual(fund_investor.loan_balance, loan_activities_latest.loan_balance)
        self.assertEqual(fund_investor.interest_paid, loan_activities_latest.interest_paid_to_date)
        self.assertEqual(
            fund_investor.loan_balance_with_unpaid_interest,
            loan_activities_latest.loan_balance + loan_activities_latest.interest_balance
        )
        self.assertEqual(fund_investor.current_interest_rate, fund_activities_latest.current_interest_rate)
        self.assertEqual(fund_investor.equity_commitment, fund_activities_latest.equity_commitment)
        self.assertEqual(fund_investor.equity_called, fund_activities_latest.equity_called_to_date)
        self.assertEqual(fund_investor.nav_share, 0) # No NAV for this fund yet, which isn't quite right, but is ok for the test.
        self.assertEqual(fund_investor.gross_share_of_investment_product, Decimal("-1625.139"))
        self.assertEqual(fund_investor.gross_distributions_recallable_to_date, 0)
        loan_sum = 50000 # loan balance, no interest yet
        expected_net_equity = fund_investor.gross_share_of_investment_product - loan_sum + fund_investor.capital_calls_since_last_nav - fund_investor.distributions_calls_since_last_nav
        self.assertEqual(fund_investor.current_net_equity, expected_net_equity)

    @mock.patch('api.libs.sendgrid.email.SendEmailService._send')
    def test_investments_flows_with_investment_id(self, mock_email_send):
        url = reverse('partner-funds-create-api-view')

        funds_payload = [
            {
                "id": "fund-1",
                "investment_product_code": "5678d",
                "name": "LaSalle Asia Opportunity Fund 6",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(funds_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 1)

        investors_payload = [
            {
                "id": "i01",
                "preferred_user_name": "user1@test.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "io1-v01",
                        "investor_account_code": "io2-code-v01",
                        "name": "Inv 01",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]
        url = reverse('investment-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(investors_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        users_count = RetailUser.objects.count()
        self.assertEqual(users_count, 2)  # three because of the admin user
        investors_count = Investor.objects.count()
        self.assertEqual(investors_count, 1)
        fund_activities_payload = [
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "share_class": "a",
                "commitment_amount": 100000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "gross_share_of_nav": 0
            }
        ]
        url = reverse('funds-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        fund_activities_count = FundActivity.objects.count()
        self.assertEqual(fund_activities_count, 1)
        fund_investment_count = FundInvestor.objects.count()
        self.assertEqual(fund_investment_count, 1)

        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        fund_activities_count = FundActivity.objects.count()
        self.assertEqual(fund_activities_count, 1)
        fund_investment_count = FundInvestor.objects.count()
        self.assertEqual(fund_investment_count, 1)


        fund_activities_payload = [
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "share_class": "a",
                "commitment_amount": 100000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "gross_share_of_nav": 0
            }
        ]
        url = reverse('funds-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        fund_investment = FundInvestor.objects.last()
        self.assertEqual(fund_investment.share_class, "a")
        self.assertIsNone(fund_investment.investment_id)


        fund_activities_payload = [
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "share_class": "class b",
                "commitment_amount": 100000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "gross_share_of_nav": 0
            },
        ]
        url = reverse('funds-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        fund_activities_count = FundActivity.objects.count()
        self.assertEqual(fund_activities_count, 2)
        fund_investment_count = FundInvestor.objects.count()
        self.assertEqual(fund_investment_count, 1) # only 1 investment
        fund_investment = FundInvestor.objects.last()
        self.assertEqual(fund_investment.share_class, "class b")
        self.assertIsNone(fund_investment.investment_id)



    @mock.patch('api.libs.sendgrid.email.SendEmailService._send')
    def test_complete_flow(self, mock_email_send):
        url = reverse('partner-funds-create-api-view')

        funds_payload = [
            {
                "id": "fund-1",
                "investment_product_code": "1234d56",
                "name": "LaSalle Asia Opportunity Fund 6",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            },
            {
                "id": "fund-2",
                "investment_product_code": "5678d",
                "name": "LRES IV",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(funds_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 2)

        investors_payload = [
            {
                "id": "i01",
                "preferred_user_name": "user1@test.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "io1-v01",
                        "investor_account_code": "io1-code-v01",
                        "name": "Inv 01",
                        "vehicle_type": "individual"
                    }
                ]
            },
            {
                "id": "i02",
                "preferred_user_name": "user2@hellosidecar.com",
                "first_name": "Michael",
                "last_name": "Flip",
                "investment_vehicles": [
                    {
                        "id": "io2-v01",
                        "investor_account_code": "io2-code-v01",
                        "name": "Inv 02",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]
        url = reverse('investment-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(investors_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        users_count = RetailUser.objects.count()
        self.assertEqual(users_count, 3)  # three because of the admin user
        investors_count = Investor.objects.count()
        self.assertEqual(investors_count, 2)
        fund_activities_payload = [
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "share_class": "a",
                "investment_id": "some_id",
                "commitment_amount": 100000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "gross_share_of_nav": 0
            },
            {
                "transaction_date": "2021-09-30T00:00",
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "share_class": "a",
                "investment_id": "another_id",
                "commitment_amount": 250000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "equity_commitment": 500,
                "equity_called_to_date": 700,
                "gross_share_of_nav": 5123,
                "gross_distributions_recallable_to_date": 100,
            }
        ]

        url = reverse('funds-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        fund_activities_count = FundActivity.objects.count()
        self.assertEqual(fund_activities_count, 2)
        fund_activity_a = FundActivity.objects.filter(investment_id="some_id")
        fund_activity_b = FundActivity.objects.filter(investment_id="another_id")
        self.assertEqual(fund_activity_b.count(), 1)
        self.assertEqual(fund_activity_a.count(), 1)
        self.assertEqual(FundActivity.objects.filter(share_class="sarasa").count(), 0)
        self.assertEqual(FundActivity.objects.filter(share_class="a").count(), 2)

        loan_activities_payload = [
            {
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "transaction_date": "2020-09-29T00:00",
                "currency": "USD",
                "share_class": "a",
                "investment_id": "some_id",
                "loan_commitment": 50000,
                "loan_balance": 50000,
                "interest_balance": 0,
                "interest_repay_income": 0,
                "interest_repay_capital": 0,
            },
            {
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "transaction_date": "2020-09-29T00:00",
                "currency": "USD",
                "share_class": "b",
                "investment_id": "another_id",
                "loan_commitment": 50000,
                "loan_balance": 50000,
                "interest_balance": 0,
                "interest_repay_income": 0,
                "interest_repay_capital": 0,
            },
            {
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d",
                "transaction_date": "2020-09-29T00:00",
                "currency": "USD",
                "share_class": "c",
                "investment_id": "another_investment_id",
                "loan_commitment": 50000,
                "loan_balance": 50000,
                "interest_balance": 0,
                "interest_repay_income": 0,
                "interest_repay_capital": 0,
            },
        ]

        url = reverse('loans-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(loan_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        loan_activities_count = LoanActivity.objects.count()
        self.assertEqual(loan_activities_count, 3)
        loan_activity_a = LoanActivity.objects.filter(investment_id="some_id")
        loan_activity_b = LoanActivity.objects.filter(investment_id="another_id")
        loan_activity_c = LoanActivity.objects.filter(investment_id="another_investment_id")
        loan_activity_non_existent = LoanActivity.objects.filter(share_class="sarasa")
        self.assertEqual(loan_activity_a.count(), 1)
        self.assertEqual(loan_activity_b.count(), 1)
        self.assertEqual(loan_activity_c.count(), 1)
        self.assertEqual(loan_activity_non_existent.count(), 0)

        fund_investor_a = FundInvestor.objects.filter(investment_id="some_id")
        fund_investor_b = FundInvestor.objects.filter(investment_id="another_id")
        fund_investor_c = FundInvestor.objects.filter(investment_id="another_investment_id")
        fund_investor_non_existent = FundInvestor.objects.filter(share_class="sarasa")
        self.assertEqual(fund_investor_a.count(), 1)
        self.assertEqual(fund_investor_b.count(), 1)
        self.assertEqual(fund_investor_c.count(), 0)
        self.assertEqual(fund_investor_non_existent.count(), 0)

        pairs = [
            (loan_activity_a.first(), fund_activity_a.first(), fund_investor_a.first(), fund_activities_payload[0]),
            (loan_activity_b.first(), fund_activity_b.first(), fund_investor_b.first(), fund_activities_payload[1]),
        ]

        for loan_activities_latest, fund_activities_latest, fund_investor, fund_activity_payload in pairs:
            self.assertEqual(fund_investor.currency_id, self.base_currency.id)
            self.assertEqual(fund_investor.loan_commitment, loan_activities_latest.loan_commitment)
            self.assertEqual(fund_investor.loan_balance, loan_activities_latest.loan_balance)
            self.assertEqual(fund_investor.interest_paid, loan_activities_latest.interest_paid_to_date)
            self.assertEqual(
                fund_investor.loan_balance_with_unpaid_interest,
                loan_activities_latest.loan_balance + loan_activities_latest.interest_balance
            )
            self.assertEqual(fund_investor.current_interest_rate, fund_activities_latest.current_interest_rate)
            self.assertEqual(fund_investor.equity_commitment, fund_activities_latest.equity_commitment)
            self.assertEqual(fund_investor.equity_called, fund_activities_latest.equity_called_to_date)
            self.assertEqual(fund_investor.nav_share, 0)
            if 'gross_share_of_nav' in fund_activity_payload:
                self.assertEqual(fund_investor.gross_share_of_investment_product, Decimal(fund_activity_payload['gross_share_of_nav']))
            if 'gross_distributions_recallable_to_date' in fund_activity_payload:
                self.assertEqual(fund_investor.gross_distributions_recallable_to_date, Decimal(fund_activity_payload['gross_distributions_recallable_to_date']))

        _, __, fund_investor, ___ = pairs[1]

        url = reverse('funds-nav-create-api-view')
        expected_nav = Decimal("131338660.2144779")
        payload = {
            "fund_id": fund_investor.fund.partner_id,
            "as_of": str(timezone.now().date()),
            "nav": str(expected_nav)
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        fund_investor.refresh_from_db()
        fund_nav = FundNav.objects.latest('id')
        self.assertEqual(fund_nav.nav, expected_nav)
        self.assertEqual(fund_investor.nav_share, expected_nav)

        url = reverse('investor-document-create-api-view')
        for i in range(0, 2):
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'investDoc{}'.format(i),
                'investor_vehicle_id': 'io2-v01',
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_type': 'agreement',
                'file_data': origin_file_obj,
                'skip_notification': True,
                'file_date': str(timezone.now().date()),
                'fund_id': fund_investor.fund.partner_id
            }
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Document.objects.count(), 2)
        investor = Investor.objects.get(partner_id='io2-v01')
        self.assertEqual(investor.investor_documents.count(), 2)
        fund = Fund.objects.get(partner_id='fund-1')
        fund.publish_investment_details = True
        fund.save()

        url = reverse('funds-document-create-api-view')
        for i in range(0, 2):
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'fundDoc{}'.format(i),
                'fund_id': 'fund-1',
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_type': 'tax',
                'file_data': origin_file_obj,
                "file_date": str(timezone.now().date())
            }
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Document.objects.count(), 4)
        self.assertEqual(fund.fund_documents.count(), 2)

        fund.publish_investment_details = False
        fund.save()

        # Test uploading a capital call using file name parsing
        url = reverse('investor-document-create-api-view')
        content_type = "text/plain"
        contents = b"The greatest capital-call in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'capital-call-1',
            'skip_notification': False,
            'parse_file_name': True,
            'file_content_type': content_type,
            'file_name': "abcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd_efg_{}_{}_capital-call_1_2021-12-10_2022-01-10.txt".format("fund-1", "io2-v01"),
            'file_data': origin_file_obj
        }
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'skip_notification must be true for unpublished funds'
        )

        fund.publish_investment_details = True
        fund.save()
        contents = b"The greatest capital-call in human history"
        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj

        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Document.objects.count(), 5)
        investor = Investor.objects.get(partner_id='io2-v01')
        self.assertEqual(investor.investor_documents.count(), 3)
        notification = UserNotification.objects.get(
            notification_type=UserNotification.NotificationTypeChoice.CAPITAL_CALL)
        expected_date = datetime.date(2021, 12, 10)
        expected_due_date = datetime.date(2022, 1, 10)
        self.assertEqual(notification.document_date, expected_date)
        self.assertEqual(notification.due_date, expected_due_date)

    @mock.patch('api.funds.services.publish_fund.async_task')
    def test_publish_flow_with_notification(self, mock_email_send):
        url = reverse('partner-funds-create-api-view')

        funds_payload = [
            {
                "id": "fund-1",
                "investment_product_code": "5678d90",
                "name": "LaSalle Asia Opportunity Fund 6",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            },
            {
                "id": "fund-2",
                "investment_product_code": "1234d",
                "name": "LRES IV",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            }

        ]
        response = self.client.post(
            url,
            data=json.dumps(funds_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 2)

        investors_payload = [
            {
                "id": "i01",
                "preferred_user_name": "user1@test.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "io1-v01",
                        "investor_account_code": "io1-code-v01",
                        "name": "Inv 01",
                        "vehicle_type": "individual"
                    },
                    {
                        "id": "io1-v02",
                        "investor_account_code": "io1-code-v02",
                        "name": "Inv 01 Trust"
                    },
                ]
            },
            {
                "id": "i02",
                "preferred_user_name": "user2@hellosidecar.com",
                "first_name": "Michael",
                "last_name": "Flip",
                "investment_vehicles": [
                    {
                        "id": "io2-v01",
                        "investor_account_code": "io2-code-v01",
                        "name": "Inv 02",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]
        url = reverse('investment-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(investors_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        users_count = RetailUser.objects.count()
        self.assertEqual(users_count, 3)  # Three because we created an admin plus the two investors we added.
        investors_count = Investor.objects.count()
        self.assertEqual(investors_count, 3)

        fund_activities_payload = [
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io1-code-v01",
                "investment_product_code": "5678d90",
                "commitment_amount": 100000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "gross_share_of_nav": 0
            },
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io1-code-v02",
                "investment_product_code": "5678d90",
                "commitment_amount": 100000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "gross_share_of_nav": 0
            },
            {
                "transaction_date": "2021-09-30T00:00",
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "1234d",
                "commitment_amount": 250000,
                "outstanding_commitment": 0,
                "income_distibutions": 0,
                "leveraged_irr": 0,
                "unleveraged_irr": 0,
                "current_leverage_rate": 0,
                "initial_leverage_rate": 0,
                "current_interest_rate": 0,
                "fund_ownership": 1,
                "capital_called_since_last_nav": 0,
                "distributions_since_last_nav": 0,
                "unrealized_gain_loss": 0,
                "gain_loss": 0,
                "called_to_date": 0,
                "equity_commitment": 500,
                "equity_called_to_date": 700,
                "gross_share_of_nav": 5123,
                "gross_distributions_recallable_to_date": 100,
            }
        ]

        url = reverse('funds-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        fund_activities_count = FundActivity.objects.count()
        self.assertEqual(fund_activities_count, 3)

        loan_activities_payload = [
            {
                "investor_account_code": "io1-code-v01",
                "investment_product_code": "5678d90",
                "transaction_date": "2020-09-29T00:00",
                "currency": "USD",
                "loan_commitment": 50000,
                "loan_balance": 50000,
                "interest_balance": 0,
                "interest_repay_income": 0,
                "interest_repay_capital": 0,
            },
            {
                "investor_account_code": "io2-code-v01",
                "investment_product_code": "5678d90",
                "transaction_date": "2020-09-30T00:00",
                "currency": "USD",
                "loan_commitment": 200000,
                "loan_balance": 100000,
                "interest_paid_to_date": 300000,
                "interest_balance": 0,
                "interest_repay_income": 0,
                "interest_repay_capital": 0,
            }
        ]

        url = reverse('loans-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(loan_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        loan_activities_count = LoanActivity.objects.count()
        self.assertEqual(loan_activities_count, 2)

        fund = Fund.objects.get(partner_id='fund-1')
        fund_investors = fund.fund_investors.count()
        self.assertEqual(fund_investors, 2)

        # Publish the fund
        url = reverse('publish-fund', kwargs={'pk': fund.id})
        self.client.force_authenticate(self.user)
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # check to make sure that one email got sent.
        self.assertEqual(mock_email_send.call_count, 1)

    def test_investor_without_loan_flow(self):
        url = reverse('partner-funds-create-api-view')

        funds_payload = [
            {
                "id": "fund-1",
                "investment_product_code": "fund-code-1",
                "name": "LaSalle Asia Opportunity Fund 6",
                "business_line": "EurOpe  Private",
                "fund_type": "Closed",
                "currency": "USD"
            },
        ]
        response = self.client.post(
            url,
            data=json.dumps(funds_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        funds_count = Fund.objects.count()
        self.assertEqual(funds_count, 1)

        investors_payload = [
            {
                "id": "i01",
                "preferred_user_name": "user1@test.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "io1-v01",
                        "investor_account_code": "io1-code-v01",
                        "name": "Inv 01",
                        "vehicle_type": "individual"
                    }
                ]
            },
        ]
        url = reverse('investment-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(investors_payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        users_count = RetailUser.objects.count()
        self.assertEqual(users_count, 2)  # two because of the admin user.
        investors_count = Investor.objects.count()
        self.assertEqual(investors_count, 1)

        fund_activities_payload = [
            {
                "transaction_date": "2021-09-29T00:00",
                "investor_account_code": "io1-code-v01",
                "investment_product_code": "fund-code-1",
            },
        ]

        url = reverse('funds-activity-create-api-view')
        response = self.client.post(
            url,
            data=json.dumps(fund_activities_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        fund_activities_count = FundActivity.objects.count()
        self.assertEqual(fund_activities_count, 1)
        fund_activities_latest = FundActivity.objects.latest('transaction_date')

        fund_investors_qs = FundInvestor.objects.all()
        self.assertEqual(fund_investors_qs.count(), 1)

        fund_investor = fund_investors_qs.first()
        self.assertEqual(fund_investor.currency_id, self.base_currency.id)
        self.assertEqual(fund_investor.loan_commitment, 0)
        self.assertEqual(fund_investor.loan_balance, 0)
        self.assertEqual(fund_investor.interest_paid, 0)
        self.assertEqual(fund_investor.loan_balance_with_unpaid_interest, 0)
        self.assertEqual(fund_investor.current_interest_rate, 0)
        self.assertEqual(fund_investor.equity_commitment, fund_activities_latest.equity_commitment)
        self.assertEqual(fund_investor.equity_called, fund_activities_latest.equity_called_to_date)
        self.assertEqual(fund_investor.nav_share, 0)

    def test_transaction_details_flow(self):
        fund = FundFactory(company=self.company, investment_product_code="za06a")
        investor = InvestorFactory()
        investor2 = InvestorFactory()
        url = reverse('transaction-detail-create-api-view')
        transaction_activity_payload = [
            {'control_number': 1,
             'investor_account_code': investor.investor_account_code,
             'investment_product_code': "za06ab41",
             'effective_date': "2021-12-31",
             'transaction_type': 1,
             'actual_transaction_amount': 12_999.99
             },
            {'control_number': 2,
             'investor_account_code': investor.investor_account_code,
             'investment_product_code': "za06ab41",
             'effective_date': "2022-01-01",
             'transaction_type': 6,
             'actual_transaction_amount': 68.56
             },
            {'control_number': 3,
             'investor_account_code': investor.investor_account_code,
             'investment_product_code': "za06ab41",
             'effective_date': "2022-01-02",
             'transaction_type': 6,
             'actual_transaction_amount': 35.88
             },
            {'control_number': 1, # re-use control number for another investor with the same transaction
             'investor_account_code': investor2.investor_account_code,
             'investment_product_code': "za06ab41",
             'effective_date': "2021-12-31",
             'transaction_type': 1,
             'actual_transaction_amount': 22_999.99
             },

        ]

        response = self.client.post(
            url,
            data=json.dumps(transaction_activity_payload),
            content_type='application/json',
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        transaction_details_q = TransactionDetail.objects.all()
        self.assertEqual(transaction_details_q.count(), 4)

        detail = transaction_details_q.first()
        self.assertEqual(detail.investor_id, investor.id)
        self.assertEqual(detail.fund_id, fund.id)
        self.assertEqual(detail.effective_date, datetime.date(2021, 12, 31))
        self.assertEqual(detail.transaction_type, TransactionDetail.TransactionDetailType.CONTRIBUTION_LOAN.value)
        self.assertEqual(detail.actual_transaction_amount, Decimal('12_999.99'))


