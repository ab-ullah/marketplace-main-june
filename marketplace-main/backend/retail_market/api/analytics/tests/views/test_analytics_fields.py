from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.currencies.models import Currency
from api.users.services.create_company_user import CreateCompanyUserService
from api.users.models import RetailUser
from api.analytics.models import EntityAction
from api.partners.tests.factories import FundFactory

# Hard code these so that if the code changes the test breaks.
ENTITY_FUND = 1
ACTION_VIEW_MARKETING_PAGE = 1

class AnalyticsViewsTestCase(APITestCase):

    def setUp(self):
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )

        self.fund = FundFactory(company=self.company, is_published=True)

        username = 'test-user'
        email = 'test-user@test.com'
        self.user, _ = RetailUser.objects.update_or_create(
            email__iexact=email,
            defaults={
                'username': username,
                'email': email
            }
        )

        if not hasattr(self.user, 'company_user'):
            CreateCompanyUserService(self.user).create_company_user(self.company)


    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            "HTTP_AUTHORIZATION": "Bearer Test-123",
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }


    def test_post_analytics_entity_action(self):
        url = reverse('analytics-create-entity-action')
        data = {
            "entity": ENTITY_FUND,
            "user_action": ACTION_VIEW_MARKETING_PAGE,
            "entity_id": self.fund.id
        }

        self.client.force_authenticate(self.user)
        response = self.client.post(
            url,
            data,
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        company_user = self.user.associated_company_users.filter(company=self.company).first()
        entity_action_query = EntityAction.objects.filter(user=company_user)
        self.assertEqual(entity_action_query.count(), 1)

        self.client.force_authenticate(self.user)
        response = self.client.post(
            url,
            data,
            **self.get_headers()
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(entity_action_query.count(), 1)

        # check that the view count incremented as we expected

        entity_action = entity_action_query[0]
        self.assertEqual(entity_action.view_count, 2)
