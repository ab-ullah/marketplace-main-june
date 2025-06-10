import json

from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.companies.models import CompanyUser
from api.companies.services.company_service import CompanyService
from api.constants.headers import API_KEY_HEADER
from api.partners.tests.factories import UserFactory


class MultipleCompanyUsersTest(APITestCase):
    def test_multiple_company_users(self):
        first_company_info = CompanyService.create_company(company_name='first_company')
        second_company_info = CompanyService.create_company(company_name='second_company')

        user = UserFactory()
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_4",
                "preferred_user_name": user.email,
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
            **{API_KEY_HEADER: first_company_info['token']}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CompanyUser.objects.filter(user=user).count(), 1)
        self.assertEqual(CompanyUser.objects.filter(user=user, company=first_company_info['company']).count(), 1)

        payload = [
            {
                "id": "user_4",
                "preferred_user_name": user.email,
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
            **{API_KEY_HEADER: second_company_info['token']}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CompanyUser.objects.filter(user=user).count(), 2)
        self.assertEqual(CompanyUser.objects.filter(user=user, company=first_company_info['company']).count(), 1)
        self.assertEqual(CompanyUser.objects.filter(user=user, company=second_company_info['company']).count(), 1)
