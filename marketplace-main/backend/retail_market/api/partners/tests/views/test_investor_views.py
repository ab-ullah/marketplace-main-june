import io
import json
from copy import deepcopy
from unittest import mock

from django.utils import timezone
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.capital_calls.models import CapitalCall
from api.companies.models import CompanyUser
from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.constants.headers import API_KEY_HEADER
from api.currencies.models import Currency
from api.documents.models import Document, InvestorDocument
from api.investors.models import Investor, CompanyUserInvestor, FundInvestor
from api.notifications.models import UserNotification
from api.partners.models import PartnerAPILog
from api.partners.serializers import CreateAuth0Account
from api.partners.tests.factories import InvestorFactory, FundFactory, CompanyUserInvestorFactory, CompanyUserFactory, \
    FundInvestorFactory, UserFactory, CompanyProfileFactory
from api.users.models import RetailUser


class PartnerViewsAPITestCase(APITestCase):

    def setUp(self):
        # Have to do this, due to the user created in data migration
        Document.objects.all().delete()
        RetailUser.objects.all().delete()
        Investor.objects.all().delete()
        FundInvestor.objects.all().delete()
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.request_count = 0
        self.company = company_info['company']
        self.api_token = company_info['token']
        self.base_currency = Currency.objects.get(
            code='USD',
            company=self.company
        )
        self.company_profile = CompanyProfileFactory(company=self.company)

    def get_headers(self):
        self.request_count = self.request_count + 1

        return {
            API_KEY_HEADER: self.api_token,
            "Sidecar-Version": "2021-09-01",
            "Sidecar-Idempotency-Key": format("requests-{}", str(self.request_count))
        }

    def test_create_investor_no_name_provided(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
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
            'Either Full Name or First and Last name should be provided'
        )

    def test_create_investor_long_full_name(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "full_name": "John Butcher Ken Declaration of Trust",
                "id": "2ea473cd-ccd3-49df-9c7b-71e7f6507f24",
                "investment_vehicles": [
                    {
                        "id": "4d06fcee-b5da-4452-8fb8-6000399cb23f",
                        "investor_account_code": "zjktrust",
                        "name": "John Butcher Ken Declaration of Trust Dated November 8, 2023"
                    }
                ],
                "preferred_user_name": "test@gmail.com"
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        request_payload = payload[0]
        user = RetailUser.objects.first()
        self.assertEqual(user.email, request_payload['preferred_user_name'])
        self.assertEqual(user.full_name, request_payload['full_name'])

        company_user_query = CompanyUser.objects.filter(user=user, company=self.company)
        self.assertEqual(company_user_query.count(), 1)

        company_user = CompanyUser.objects.filter(user=user, company=self.company).first()
        self.assertEqual(company_user.partner_id, request_payload['id'])
        investor_query = Investor.objects.filter(partner_id=request_payload['investment_vehicles'][0]['id'])
        self.assertEqual(investor_query.count(), 1)
        investor = investor_query.first()
        self.assertEqual(investor.name, request_payload['investment_vehicles'][0]['name'])

        investor_company_query = CompanyUserInvestor.objects.filter(
            company_user=company_user,
            investor=investor
        )
        self.assertEqual(investor_company_query.count(), 1)

    def test_create_investor_same_id_different_code(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_002",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
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
            response.data[0]['investment_vehicles'][0]['non_field_errors'][0],
            'Please make sure that investment vehicle has unique id and investor_account_code'
        )

    def test_create_investor_multiple_vehicles_same_account_code_in_same_request(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    },
                    {
                        "id": "investor_002",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor, Family Trust",
                    }
                ]
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
            'Please make sure that investment vehicle has unique id and investor_account_code'
        )

    def test_create_investor_multiple_vehicles_same_account_code_in_different_requests(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_002",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor, Family Trust",
                    }
                ]
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
            response.data[0]['investment_vehicles'][0]['non_field_errors'][0],
            'Please make sure that investment vehicle has unique id and investor_account_code'
        )

    def test_investor_code_exists_with_null_partner_id(self):
        investor = InvestorFactory(
            investor_account_code='investor_code_001',
            partner_id=None
        )
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Investor.objects.count(), 1)
        investor.refresh_from_db()
        self.assertEqual(investor.partner_id, 'investor_001')
        self.assertEqual(investor.name, 'John Investor')

    def test_create_investor_multiple_vehicles(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    },
                    {
                        "id": "investor_002",
                        "investor_account_code": "investor_code_002",
                        "name": "John Investor, Family Trust",
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Investor.objects.count(), 2)

        log = PartnerAPILog.objects.filter(
            response_status=201,
        ).latest('created_at')
        self.assertEqual(log.request_body, payload)

    def test_create_investor_view_full_name(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        for i in range(0, 2):
            response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

            response = self.client.post(
                url,
                data=json.dumps(payload),
                content_type='application/json',
                **self.get_headers()
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            user_count = RetailUser.objects.count()
            self.assertEqual(user_count, 1)

            request_payload = payload[0]
            user = RetailUser.objects.first()
            self.assertEqual(user.email, request_payload['preferred_user_name'])
            self.assertEqual(user.full_name, request_payload['full_name'])

            company_user_query = CompanyUser.objects.filter(user=user, company=self.company)
            self.assertEqual(company_user_query.count(), 1)

            company_user = CompanyUser.objects.filter(user=user, company=self.company).first()
            self.assertEqual(company_user.partner_id, request_payload['id'])
            investor_query = Investor.objects.filter(partner_id=request_payload['investment_vehicles'][0]['id'])
            self.assertEqual(investor_query.count(), 1)
            investor = investor_query.first()
            self.assertEqual(investor.name, request_payload['investment_vehicles'][0]['name'])

            investor_company_query = CompanyUserInvestor.objects.filter(
                company_user=company_user,
                investor=investor
            )
            self.assertEqual(investor_company_query.count(), 1)

    def test_create_investor_view_first_last_name(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        for i in range(0, 2):
            response = self.client.post(url, data=json.dumps(payload), content_type='application/json')
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

            response = self.client.post(
                url,
                data=json.dumps(payload),
                content_type='application/json',
                **self.get_headers()
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            user_count = RetailUser.objects.count()
            self.assertEqual(user_count, 1)

            request_payload = payload[0]
            user = RetailUser.objects.first()
            self.assertEqual(user.email, request_payload['preferred_user_name'])
            self.assertEqual(user.first_name, request_payload['first_name'])
            self.assertEqual(user.last_name, request_payload['last_name'])
            company_user_query = CompanyUser.objects.filter(user=user, company=self.company)
            self.assertEqual(company_user_query.count(), 1)

            company_user = CompanyUser.objects.filter(user=user, company=self.company).first()
            self.assertEqual(company_user.partner_id, request_payload['id'])
            investor_query = Investor.objects.filter(partner_id=request_payload['investment_vehicles'][0]['id'])
            self.assertEqual(investor_query.count(), 1)
            investor = investor_query.first()
            self.assertEqual(investor.name, request_payload['investment_vehicles'][0]['name'])

            investor_company_query = CompanyUserInvestor.objects.filter(
                company_user=company_user,
                investor=investor
            )
            self.assertEqual(investor_company_query.count(), 1)

    def test_investor_change_investor_account_code(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        company_user_qs = CompanyUser.objects.count()
        self.assertEqual(company_user_qs, 1)

        user = RetailUser.objects.first()
        company_user = user.associated_company_users.first()
        self.assertEqual(company_user.partner_id, payload[0]['id'])

        investor = Investor.objects.first()
        self.assertEqual(investor.investor_account_code, 'investor_code_001')

        payload[0]['investment_vehicles'][0]['investor_account_code'] = 'investor_code_002'
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        company_user_qs = CompanyUser.objects.count()
        self.assertEqual(company_user_qs, 1)
        investor.refresh_from_db()
        self.assertEqual(investor.investor_account_code, 'investor_code_002')

    def test_investor_email_partner_id_conflict(self):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        company_user_qs = CompanyUser.objects.count()
        self.assertEqual(company_user_qs, 1)

        user = RetailUser.objects.first()
        company_user = user.associated_company_users.first()
        self.assertEqual(company_user.partner_id, payload[0]['id'])

        payload[0]['preferred_user_name'] = 'test2@gmail.com'
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        company_user_qs = CompanyUser.objects.count()
        self.assertEqual(company_user_qs, 1)

        user.refresh_from_db()
        self.assertEqual(user.email, payload[0]['preferred_user_name'])
        payload[0]['id'] = 'new-updated-id'

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )

        # Now allow the partner to update the partner ID for an existing email.
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user.refresh_from_db()
        self.assertEqual(user.email, payload[0]['preferred_user_name'])

    def test_existing_user_connected_to_company(self):
        user = UserFactory()
        self.assertEqual(user.associated_company_users.count(), 0)
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": user.email,
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        company_user_qs = CompanyUser.objects.count()
        self.assertEqual(company_user_qs, 1)

        user.refresh_from_db()
        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertEqual(user.associated_company_users.first().partner_id, payload[0]['id'])

    def test_user_belongs_to_another_company_user(self):
        company_user_1 = CompanyUserFactory(
            company=self.company
        )
        user_1 = company_user_1.user

        company_user_2 = CompanyUserFactory(
            company=self.company
        )
        user_2 = company_user_2.user

        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": company_user_1.partner_id,
                "preferred_user_name": user_2.email,
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
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
            'Company User with this id exists and belongs to another user, and the provided email belongs to another company user in the same company'
        )

    def test_user_belongs_to_another_company_user_but_with_different_company(self):
        company_user_1 = CompanyUserFactory(
            company=self.company
        )
        user_1 = company_user_1.user

        company_user_2 = CompanyUserFactory()
        user_2 = company_user_2.user

        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": company_user_1.partner_id,
                "preferred_user_name": user_2.email,
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        updated_company_user = CompanyUser.objects.filter(
            company=self.company,
            user=user_2
        ).first()

        self.assertEqual(updated_company_user.id, company_user_1.id)
        self.assertFalse(
            CompanyUser.objects.filter(
                company=self.company,
                user=user_1
            ).exists()
        )

    def test_user_belongs_to_no_company(self):
        company_user_1 = CompanyUserFactory(
            company=self.company
        )
        user_1 = company_user_1.user
        user_2 = UserFactory()

        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": company_user_1.partner_id,
                "preferred_user_name": user_2.email,
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        CompanyUser.objects.filter(
            company=self.company,
            user=user_2
        ).exists()

        updated_company_user = CompanyUser.objects.filter(
            company=self.company,
            user=user_2
        ).first()

        self.assertEqual(updated_company_user.id, company_user_1.id)
        self.assertFalse(
            CompanyUser.objects.filter(
                company=self.company,
                user=user_1
            ).exists()
        )

    def test_user_with_new_email_does_not_exist(self):
        company_user_1 = CompanyUserFactory(
            company=self.company
        )
        user_1 = company_user_1.user

        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": company_user_1.partner_id,
                "preferred_user_name": 'dummy34@gmail.com',
                "first_name": "John",
                "last_name": "Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        company_user_1.refresh_from_db()
        user_1.refresh_from_db()
        self.assertEqual(company_user_1.user_id, user_1.id)
        self.assertEqual(company_user_1.user.email, payload[0]['preferred_user_name'])

    def test_existing_user_first_last_name_not_overriden_by_empty_name(self):
        user = UserFactory(
            first_name='john',
            last_name='smith',
            full_name='old full name'
        )
        self.assertEqual(user.associated_company_users.count(), 0)
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": user.email,
                "full_name": "new full name",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        company_user_qs = CompanyUser.objects.count()
        self.assertEqual(company_user_qs, 1)

        user.refresh_from_db()
        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertEqual(user.associated_company_users.first().partner_id, payload[0]['id'])
        self.assertEqual(user.first_name, 'john')
        self.assertEqual(user.last_name, 'smith')
        self.assertEqual(user.full_name, 'new full name')

    def test_existing_user_first_last_name_overriden_by_empty_name(self):
        user = UserFactory(
            first_name='john',
            last_name='smith',
            full_name='old full name'
        )
        self.assertEqual(user.associated_company_users.count(), 0)
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": user.email,
                "first_name": "mike",
                "last_name": "philips",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",
                        "vehicle_type": "individual"
                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)

        company_user_qs = CompanyUser.objects.count()
        self.assertEqual(company_user_qs, 1)

        user.refresh_from_db()
        self.assertEqual(user.associated_company_users.count(), 1)
        self.assertEqual(user.associated_company_users.first().partner_id, payload[0]['id'])
        self.assertEqual(user.first_name, 'mike')
        self.assertEqual(user.last_name, 'philips')
        self.assertEqual(user.full_name, 'old full name')

    def test_investor_documents_view_unauthorized(self):
        url = reverse('investor-document-create-api-view')
        investor = InvestorFactory()
        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'investor_id': investor.partner_id,
            'file_title': 'temp_file',
            'file_content_type': content_type,
            'file_type': 'agreement',
            'file_data': origin_file_obj
        }

        response = self.client.post(url, data=payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_investor_document_missing_fields(self):
        url = reverse('investor-document-create-api-view')
        fund = FundFactory(company=self.company, publish_investment_details=True)

        investor = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor)

        payload = {
            'id': 'investDoc01',
            'investor_vehicle_id': investor.partner_id,
            'file_name': 'temp_file',
            'file_content_type': 'text/plain',
            'file_type': 'investor-reports',
            'skip_notification': False,
            'fund_id': fund.partner_id,
            'file_date': str(timezone.now().date())
        }

        required_fields = ('fund_id', 'investor_vehicle_id', 'file_type', 'file_date')
        for field in required_fields:
            payload_copy = deepcopy(payload)
            payload_copy.pop(field)
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)
            payload_copy['file_data'] = origin_file_obj
            response = self.client.post(url, data=payload_copy, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

            self.assertEqual(
                response.data['non_field_errors'][0],
                f'{field} field is required'
            )

        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_investor_document_file_name_parsing(self):
        url = reverse('investor-document-create-api-view')
        fund = FundFactory(company=self.company, publish_investment_details=True)

        investor = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor)

        file_name = f'abc_def_{fund.partner_id}_{investor.partner_id}_investor-reports_{str(timezone.now().date())}.pdf'

        payload = {
            'id': 'investDoc01',
            'file_name': file_name,
            'file_content_type': 'text/plain',
            'skip_notification': False,
            'parse_file_name': True
        }

        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Document.objects.count(), 1)
        document = Document.objects.first()
        self.assertEqual(document.file_date, timezone.now().date())
        self.assertEqual(document.document_type, Document.DocumentType.INVESTOR_REPORTS.value)

        investor_document_count = InvestorDocument.objects.filter(investor=investor, document=document).count()
        self.assertEqual(investor_document_count, 1)

        investor_document = InvestorDocument.objects.filter(investor=investor, document=document).first()
        self.assertEqual(investor_document.fund_id, fund.id)

        log = PartnerAPILog.objects.filter(
            response_status=201,
        ).latest('created_at')
        data = deepcopy(payload)
        del data['file_data']
        self.assertEqual(log.request_body['id'], data['id'])
        self.assertEqual(log.request_body['file_name'], data['file_name'])

    @mock.patch('api.partners.services.send_document_upload_email.async_task')
    def test_distribution_notice_file_name_parsing(self, mock_send_document_email):
        url = reverse('investor-document-create-api-view')
        fund = FundFactory(company=self.company, publish_investment_details=True)

        investor = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor)

        file_name = f'abc_def_{fund.partner_id}_{investor.partner_id}_distribution_1_{str(timezone.now().date())}_{str(timezone.now().date())}.pdf'

        payload = {
            'id': 'investDoc01',
            'file_name': file_name,
            'file_content_type': 'text/plain',
            'skip_notification': False,
            'parse_file_name': True
        }

        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Document.objects.count(), 1)
        document = Document.objects.first()
        self.assertEqual(document.file_date, timezone.now().date())
        self.assertEqual(document.document_type, Document.DocumentType.DISTRIBUTIONS.value)

        investor_document_count = InvestorDocument.objects.filter(investor=investor, document=document).count()
        self.assertEqual(investor_document_count, 1)

        investor_document = InvestorDocument.objects.filter(investor=investor, document=document).first()
        self.assertEqual(investor_document.fund_id, fund.id)

        args, _ = mock_send_document_email.call_args
        # self.async_send_document_email, self.document_title, self.document_type, self.notification_id
        # args[0] - callback function
        # args[1] - document title
        # args[2] - document type
        # args[3] - notification id
        self.assertEqual(args[2], "Distribution Notice")

    def test_investor_document_bad_file_name_parsing(self):
        url = reverse('investor-document-create-api-view')
        fund = FundFactory(company=self.company)

        investor = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor)

        file_name = f'abc_def_{fund.partner_id}_{investor.partner_id}_investor-garbage_{str(timezone.now().date())}.pdf'

        payload = {
            'id': 'investDoc01',
            'file_name': file_name,
            'file_content_type': 'text/plain',
            'skip_notification': False,
            'parse_file_name': True
        }

        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(
            response.data['non_field_errors'][0],
            'Invalid value in file_type parsed from file_name'
        )

        file_name = f'abc_def_{fund.partner_id}_{investor.partner_id}_investor-reports_44-44-2031.pdf'

        payload = {
            'id': 'investDoc01',
            'file_name': file_name,
            'file_content_type': 'text/plain',
            'skip_notification': False,
            'parse_file_name': True
        }

        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)
        payload['file_data'] = origin_file_obj
        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(
            response.data['non_field_errors'][0],
            'Invalid value in file_date parsed from file_name'
        )

    def test_investor_documents_view(self):
        url = reverse('investor-document-create-api-view')
        fund = FundFactory(company=self.company, publish_investment_details=True)

        investor = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor)

        investor_2 = InvestorFactory()
        company_user_2 = CompanyUserFactory(company=self.company)
        CompanyUserInvestorFactory(investor=investor_2, company_user=company_user_2)
        FundInvestorFactory(fund=fund, investor=investor_2)

        notifications = ['agreement', 'pitchbook', 'investor-reports', 'financial-statements', 'purchase-agreements']
        mapped_notifications_type = [
            UserNotification.NotificationTypeChoice.AGREEMENT.value,
            UserNotification.NotificationTypeChoice.PITCH_BOOK.value,
            UserNotification.NotificationTypeChoice.INVESTOR_REPORTS.value,
            UserNotification.NotificationTypeChoice.FINANCIAL_STATEMENTS.value,
            UserNotification.NotificationTypeChoice.PURCHASED_AGREEMENTS.value,
        ]
        mapped_document_type = [
            Document.DocumentType.AGREEMENT.value,
            Document.DocumentType.PITCH_BOOK.value,
            Document.DocumentType.INVESTOR_REPORTS.value,
            Document.DocumentType.FINANCIAL_STATEMENTS.value,
            Document.DocumentType.PURCHASE_AGREEMENTS.value,
        ]

        for i in range(0, 2):
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'investDoc-{}'.format(i),
                'investor_vehicle_id': investor.partner_id,
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_type': notifications[i],
                'file_data': origin_file_obj,
                'skip_notification': False,
                'fund_id': fund.partner_id,
                'file_date': str(timezone.now().date())
            }
            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

            document = Document.objects.latest('created_at')
            self.assertEqual(document.title, payload['file_name'])
            self.assertIsNotNone(document.document_path)
            self.assertEqual(document.document_type, mapped_document_type[i])

            investor_document_count = InvestorDocument.objects.filter(investor=investor, document=document).count()
            self.assertEqual(investor_document_count, 1)

            investor_document = InvestorDocument.objects.filter(investor=investor, document=document).first()
            self.assertEqual(investor_document.fund_id, fund.id)

            self.assertEqual(company_user_1.company_user_notifications.count(), i + 1)
            notification = company_user_1.company_user_notifications.latest('created_at')
            self.assertEqual(notification.notification_type, mapped_notifications_type[i])

            self.assertEqual(company_user_2.company_user_notifications.count(), 0)

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_investor_document_capital_call(self, mock_email_send):
        fund = FundFactory(company=self.company, publish_investment_details=True)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)
        url = reverse('investor-document-create-api-view')

        # Upload the same capital call twice, make sure it does not send
        # more than one email.
        for i in range(0, 2):
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'funddoc01',
                'fund_id': fund.partner_id,
                'investor_vehicle_id': investor_1.partner_id,
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
        self.assertEqual(document.document_type, Document.DocumentType.CAPITAL_CALL.value)
        self.assertIsNotNone(document.document_path)

        investor_document_count = InvestorDocument.objects.filter(investor=investor_1, document=document).count()
        self.assertEqual(investor_document_count, 1)

        investor_document = InvestorDocument.objects.filter(investor=investor_1, document=document).first()
        self.assertEqual(investor_document.fund_id, fund.id)

        self.assertEqual(company_user_1.company_user_notifications.count(), 1)
        notification_1 = company_user_1.company_user_notifications.latest('created_at')
        self.assertEqual(
            notification_1.notification_type,
            UserNotification.NotificationTypeChoice.CAPITAL_CALL.value
        )

        capital_calls = CapitalCall.objects.filter(fund=fund).count()
        self.assertEqual(capital_calls, 1)
        self.assertEqual(mock_email_send.call_count, 1)
        args, kwargs = mock_email_send.call_args
        email_body = kwargs['body']
        self.assertIn("{} Team".format(self.company_profile.program_name), email_body)
        self.assertIn("{} Program".format(self.company_profile.program_name), email_body)

    def test_investor_document_unpublished_fund(self):
        fund = FundFactory(company=self.company)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)
        url = reverse('investor-document-create-api-view')

        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'funddoc01',
            'fund_id': fund.partner_id,
            'investor_vehicle_id': investor_1.partner_id,
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': 'pitchbook',
            'file_date': str(timezone.now().date()),
            'due_date': str(timezone.now().date())
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

    def test_investor_document_fund_does_not_exist(self):
        fund = FundFactory(company=self.company)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)
        url = reverse('investor-document-create-api-view')

        content_type = "text/plain"
        contents = b"The greatest document in human history"
        origin_file_obj = io.BytesIO(contents)

        payload = {
            'id': 'funddoc01',
            'fund_id': 'garbage',
            'investor_vehicle_id': investor_1.partner_id,
            'file_name': 'temp_file',
            'file_content_type': content_type,
            'file_data': origin_file_obj,
            'skip_notification': False,
            'file_type': 'pitchbook',
            'file_date': str(timezone.now().date()),
            'due_date': str(timezone.now().date())
        }

        response = self.client.post(url, data=payload, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['non_field_errors'][0],
            'No fund found with id: {}'.format(payload['fund_id'])
        )

    @mock.patch('api.libs.sendgrid.email.SendEmailService.send_html_email')
    def test_investor_document_email_message(self, mock_email_send):
        fund = FundFactory(company=self.company, publish_investment_details=True)
        investor_1 = InvestorFactory()
        company_user_1 = CompanyUserFactory(company=self.company)  # type: CompanyUser
        CompanyUserInvestorFactory(investor=investor_1, company_user=company_user_1)
        FundInvestorFactory(fund=fund, investor=investor_1)
        url = reverse('investor-document-create-api-view')

        # Upload the same document twice, make sure it does not send
        # more than one email.
        for i in range(0, 2):
            content_type = "text/plain"
            contents = b"The greatest document in human history"
            origin_file_obj = io.BytesIO(contents)

            payload = {
                'id': 'funddoc01',
                'fund_id': fund.partner_id,
                'investor_vehicle_id': investor_1.partner_id,
                'file_name': 'temp_file',
                'file_content_type': content_type,
                'file_data': origin_file_obj,
                'skip_notification': False,
                'file_type': 'tax',
                'file_date': str(timezone.now().date()),
                'due_date': str(timezone.now().date())
            }

            response = self.client.post(url, data=payload, **self.get_headers())
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        document = Document.objects.latest('created_at')

        investor_document_count = InvestorDocument.objects.filter(investor=investor_1, document=document).count()
        self.assertEqual(investor_document_count, 1)

        investor_document = InvestorDocument.objects.filter(investor=investor_1, document=document).first()
        self.assertEqual(investor_document.fund_id, fund.id)

        self.assertEqual(mock_email_send.call_count, 1)
        args, kwargs = mock_email_send.call_args
        email_body = kwargs['body']
        self.assertIn("{} Team".format(self.company_profile.program_name), email_body)
        self.assertIn("{} Program".format(self.company_profile.program_name), email_body)
        self.assertIn("The lasalle Employee Co-Investment Team has published a Tax Document", email_body)
        self.assertIn("Co-Investment Portal to access the Tax Document.", email_body)

    @mock.patch.object(CreateAuth0Account, 'create_auth0_account')
    def test_create_investor_without_sso_domains(self, mocket_create_auth0_account):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@gmail.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)
        self.assertFalse(mocket_create_auth0_account.called)

    @mock.patch.object(CreateAuth0Account, 'create_auth0_account')
    def test_create_investor_with_same_email_domain(self, mocket_create_auth0_account):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@testdomain.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        self.company.sso_domains = ['testdomain.com']
        self.company.save()

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)
        self.assertFalse(mocket_create_auth0_account.called)

        # verify that updating the email with different domain triggers the task
        email_with_different_domain = 'test@xyz.com'
        payload[0]['preferred_user_name'] = email_with_different_domain
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = RetailUser.objects.get(email=email_with_different_domain)
        self.assertEqual(user.email, email_with_different_domain)
        self.assertTrue(mocket_create_auth0_account.called)

    @mock.patch.object(CreateAuth0Account, 'create_auth0_account')
    def test_create_investor_with_different_email_domain(self, mocket_create_auth0_account):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@diffdomain.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        self.company.sso_domains = ['testdomain.com']
        self.company.save()

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)
        self.assertTrue(mocket_create_auth0_account.called)

    @mock.patch('api.partners.services.auth0_account_service.CreateAuth0Account.create_auth0_account')
    def test_create_investor_with_different_email_domain_multiple_uploads(self, test_mock):
        url = reverse('investment-create-api-view')
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@diffdomain.com",
                "full_name": "John Smith",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        self.company.sso_domains = ['testdomain.com']
        self.company.save()

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)
        self.assertEqual(test_mock.call_count, 1)

        # Call again, changing the investors name
        payload = [
            {
                "id": "user_001",
                "preferred_user_name": "test@diffdomain.com",
                "full_name": "John Smyth",
                "investment_vehicles": [
                    {
                        "id": "investor_001",
                        "investor_account_code": "investor_code_001",
                        "name": "John Investor",

                    }
                ]
            }
        ]

        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type='application/json',
            **self.get_headers()
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user_count = RetailUser.objects.count()
        self.assertEqual(user_count, 1)
        self.assertEqual(test_mock.call_count, 1)
