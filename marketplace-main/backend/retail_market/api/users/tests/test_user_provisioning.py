from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from django.conf import settings
from unittest import mock

from api.constants.headers import API_KEY_HEADER
from api.libs.auth0.jwt import jwt_get_username_from_payload_handler
from api.users.models import RetailUser
from api.companies.models import Company, CompanyUser
from api.currencies.models import Currency
from api.companies.services.company_service import CompanyService
import json


class ProvisionUsersTestCase(APITestCase):

    def setUp(self):
        company_info = CompanyService.create_company(company_name='secondcompany')
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )

    def mocked_get_partner_api_headers(self):
        self.request_count = self.request_count + 1
        return {
            API_KEY_HEADER: self.api_token,
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def mocked_requests_get(*args, **kwargs):
        class MockResponse:
            def __init__(self, json_data, status_code):
                self.json_data = json_data
                self.status_code = status_code

            def json(self):
                return self.json_data

        domain = settings.AUTH0_DOMAIN
        url = 'https://{domain}/userinfo'.format(domain=domain)
        if args[0] == url:
            if kwargs['headers']['Authorization'] == 'Bearer token_4_user1':
                return MockResponse({"email": "user1@firstcompany.com"}, 200)
            if kwargs['headers']['Authorization'] == 'Bearer token_4_user3':
                return MockResponse({"email": "user3@somedomain.com"}, 200)
            if kwargs['headers']['Authorization'] == 'Bearer token_4_user4':
                return MockResponse({"email": "user4@othercompany.com"}, 200)
            if kwargs['headers']['Authorization'] == 'Bearer token_5_user5':
                return MockResponse({"email": "user5@secondcompany.com"}, 200)

        return MockResponse(args[0], 404)

    @mock.patch('api.libs.auth0.jwt.requests.get', side_effect=mocked_requests_get)
    def test_create_new_user_from_user_token(self, mock_get):
        payload = { 'sub': 'email|1234567890abc', 'token': 'token_4_user1'}

        # User gets provisioned in the JWT parsing function
        jwt_get_username_from_payload_handler(payload)

        user = RetailUser.objects.get(username='email.1234567890abc')
        self.assertEqual(user.email, 'user1@firstcompany.com')

        company = Company.objects.get(name='firstcompany')
        self.assertIsInstance(company, Company)

        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertTrue(user.associated_company_users.filter(company=company).exists())

    def test_create_new_user_using_partner_api(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_2",
                "preferred_user_name": "user2@secondcompany.com",
                "full_name": "FirstName LastName",
                "investment_vehicles": [
                    {
                        "id": "investor_002",
                        "investor_account_code": "investor_code_002",
                        "name": "User2 Investor",
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.mocked_get_partner_api_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = RetailUser.objects.get(username='user2@secondcompany.com')
        self.assertEqual(user.email, 'user2@secondcompany.com')

        company = Company.objects.get(name='secondcompany')
        self.assertIsInstance(company, Company)

        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertTrue(user.associated_company_users.filter(company=company).exists())

    @mock.patch('api.libs.auth0.jwt.requests.get', side_effect=mocked_requests_get)
    def test_create_new_user_using_partner_api_and_login(self, mock_get):
        # Partner API investor POST
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_3",
                "preferred_user_name": "user3@somedomain.com",
                "full_name": "FirstName LastName",
                "investment_vehicles": [
                    {
                        "id": "investor_003",
                        "investor_account_code": "investor_code_003",
                        "name": "User3 Investor",
                    }
                ]
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.mocked_get_partner_api_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = RetailUser.objects.get(username='user3@somedomain.com')
        self.assertEqual(user.email, 'user3@somedomain.com')

        # The investor got created using secondcompany token, the new user should be linked to SecondCompany
        company = Company.objects.get(name='secondcompany')
        self.assertIsInstance(company, Company)
        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertTrue(user.associated_company_users.filter(company=company).exists())

        # User login
        payload = {'sub': 'email|1234567890def', 'token': 'token_4_user3'}
        jwt_get_username_from_payload_handler(payload)

        # Verify only one user exists with the given email and is linked to SecondCompany
        users = list(RetailUser.objects.filter(email='user3@somedomain.com').all())
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0].associated_company_users.count(), 1)
        self.assertTrue(users[0].associated_company_users.filter(company=company).exists())

    @mock.patch('api.libs.auth0.jwt.requests.get', side_effect=mocked_requests_get)
    def test_login_and_call_partner_api(self, mock_get):
        # User login
        payload = {'sub': 'email|1234567890ghi', 'token': 'token_4_user4'}
        jwt_get_username_from_payload_handler(payload)

        user = RetailUser.objects.get(username='email.1234567890ghi')
        self.assertEqual(user.email, 'user4@othercompany.com')
        # The investor got created using the email domain, the new user should be linked to othercompany
        company = Company.objects.get(name='othercompany')
        self.assertIsInstance(company, Company)
        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertTrue(user.associated_company_users.filter(company=company).exists())

        # Partner API investor POST
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_4",
                "preferred_user_name": "user4@othercompany.com",
                "full_name": "FirstName LastName",
                "investment_vehicles": [
                    {
                        "id": "investor_004",
                        "investor_account_code": "investor_code_004",
                        "name": "User4 Investor",
                    }
                ]
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.mocked_get_partner_api_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CompanyUser.objects.filter(user=user).count(), 2)
        self.assertEqual(CompanyUser.objects.filter(user=user, company=self.company).count(), 1)
        self.assertEqual(CompanyUser.objects.filter(user=user, company=company).count(), 1)

    @mock.patch('api.libs.auth0.jwt.requests.get', side_effect=mocked_requests_get)
    def test_login_and_call_partner_api_same_company(self, mock_get):
        # User login
        payload = {'sub': 'email|5', 'token': 'token_5_user5'}
        jwt_get_username_from_payload_handler(payload)

        user = RetailUser.objects.get(username='email.5')
        self.assertEqual(user.email, 'user5@secondcompany.com')
        # The investor got created using the email domain, the new user should be linked to secondcompany
        company = Company.objects.get(name='secondcompany')
        self.assertIsInstance(company, Company)

        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertTrue(user.associated_company_users.filter(company=company).exists())

        # Partner API investor POST
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_5",
                "preferred_user_name": "user5@secondcompany.com",
                "full_name": "FirstName LastName",
                "investment_vehicles": [
                    {
                        "id": "investor_005",
                        "investor_account_code": "investor_code_005",
                        "name": "User5 Investor",
                    }
                ]
            }
        ]
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.mocked_get_partner_api_headers()
        )
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
