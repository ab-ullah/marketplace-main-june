import json, csv, io
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.currencies.models import Currency
from api.users.services.create_company_user import CreateCompanyUserService
from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.users.models import RetailUser
from api.funds.models import FundInterest
from api.partners.tests.factories import FundFactory, UserFactory

# Hard code these so that if the code changes the test breaks.
ENTITY_FUND = 1
ACTION_VIEW_MARKETING_PAGE = 1
ACTION_VIEW_INTEREST_PAGE = 2

class AnalyticsViewsFundInterestTestCase(APITestCase):

    def setUp(self):
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )

        self.fund = FundFactory(company=self.company)


        username = 'test-user'
        email = 'test-user@test.com'
        self.user, _ = RetailUser.objects.update_or_create(
            email__iexact=email,
            defaults={
                'username': username,
                'email': email,
                'is_sidecar_admin': True,
            }
        )

        # Make self.user an admin for this company.
        CreateAdminUserService(email, self.company.name).create()

        if not hasattr(self.user, 'company_user'):
            CreateCompanyUserService(self.user).create_company_user(self.company)

        # Create some other users for testing.
        self.user2 = UserFactory()
        if not hasattr(self.user2, 'company_user'):
            CreateCompanyUserService(self.user2).create_company_user(self.company)

        self.user3 = UserFactory()
        if not hasattr(self.user3, 'company_user'):
            CreateCompanyUserService(self.user3).create_company_user(self.company)


    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            "HTTP_AUTHORIZATION": "Bearer Test-123",
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def add_fund_page_view(self, user):
        url = reverse('analytics-create-entity-action')
        data = {
            "entity": ENTITY_FUND,
            "user_action": ACTION_VIEW_MARKETING_PAGE,
            "entity_id": self.fund.id
        }

        self.client.force_authenticate(user)
        self.client.post(
            url,
            data,
            **self.get_headers()
        )

    def add_interest_page_view(self, user):
        url = reverse('analytics-create-entity-action')
        data = {
            "entity": ENTITY_FUND,
            "user_action": ACTION_VIEW_INTEREST_PAGE,
            "entity_id": self.fund.id
        }

        self.client.force_authenticate(user)
        self.client.post(
            url,
            data,
            **self.get_headers()
        )

    def indicate_interest(self, user, equity, leverage, extra_details=None):
        fi = FundInterest()
        company_user = user.associated_company_users.filter(company=self.company).first()
        fi.user = company_user
        fi.fund = self.fund
        fi.equity_amount = equity
        fi.leverage_amount = equity * leverage
        fi.interest_details = {
            "name": "Test User",
            "jobBand": {"label": "M5", "value": "M5"},
            "jobTitle": "",
            "department": {"label": "Accounting", "value": "accounting"},
            "entityType": "",
            "taxCountry": {"label": "USA", "value": "USA"},
            "eligibility": "eligible-yes",
            "officeLocation": {"label": "Chicago", "value": "chicago"},
            "investmentAmount": "10000",
            "interestedInLeverage": "leverage-yes"
        }

        if extra_details is not None and len(extra_details) > 0:
            fi.interest_details.update(extra_details)

        fi.save()

    def test_get_analytics_fund_interest(self):
        # Add some page views
        self.add_fund_page_view(self.user)
        self.add_fund_page_view(self.user2)
        self.add_fund_page_view(self.user3)

        # Add some interest views
        self.add_interest_page_view(self.user2)
        self.add_interest_page_view(self.user3)

        # Submit an interest form
        equity = 25000
        leverage = 2
        self.indicate_interest(self.user2, equity=equity, leverage=leverage)
        self.indicate_interest(self.user3, equity=equity, leverage=1, extra_details={
            'my-question-1': 'my-answer-1',
            'my-question-2': 'my-answer-2',
            'my-question-3': 'my-answer-3'
        })

        url = reverse('analytics-fund-interest', kwargs={'slug':self.fund.slug})

        self.client.force_authenticate(self.user)
        response = self.client.get(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = json.loads(response.content)
        self.assertEqual(data['visited_fund_page'], 3)
        self.assertEqual(data['visited_interest_page'], 2)
        self.assertEqual(data['submitted_interest_form'], 2)
        self.assertEqual(data['total_equity_investment'], 2 * equity)
        self.assertEqual(data['total_leverage_requested'], equity * leverage + equity)

        url = reverse('analytics-fund-interest-export', kwargs={'slug':self.fund.slug, 'fund_id':self.fund.id})
        self.client.force_authenticate(self.user)
        response = self.client.get(
            url,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.content.decode('utf-8')
        reader = csv.reader(io.StringIO(data))
        headers = next(reader)
        self.assertEqual(headers[0], "Submitted By")
        self.assertEqual(headers[1], "User Email")
        self.assertEqual(headers[2], "Submission Date")
        self.assertEqual(headers[3], "Equity Amount")
        self.assertEqual(headers[4], "Leverage Amount")
        self.assertEqual(headers[5], 'name')
        self.assertEqual(headers[6], 'jobBand')








