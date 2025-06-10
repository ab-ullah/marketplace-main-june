from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.partners.tests.factories import UserFactory, CompanyUserFactory, CompanyFactory, FundFactory


class TestFundManagerListCreateAPIView(APITestCase):

    @classmethod
    def setUpClass(cls):
        super(TestFundManagerListCreateAPIView, cls).setUpClass()
        cls.user = UserFactory()
        cls.company = CompanyFactory()
        cls.company_user = CompanyUserFactory(company=cls.company)
        cls.fund = FundFactory(company=cls.company)
        CreateAdminUserService(email=cls.user.email, company_name=cls.company.name).create()
        cls.url = reverse('admin-fund-manager-list-create', kwargs={'fund_external_id': cls.fund.external_id})

    def test_create_fund_manager_view_with_non_admin(self):
        self.client.force_authenticate(self.company_user.user)
        payload = {'full_name': 'John Snow', 'bio': 'test bio'}
        response = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fund_manager_list_view_with_non_admin(self):
        self.client.force_authenticate(self.company_user.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_fund_manager_view(self):
        self.client.force_authenticate(self.user)
        payload = {'full_name': 'John Snow', 'bio': 'test bio'}
        response = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.company.company_fund_managers.count(), 1)
        self.assertEqual(self.company.company_fund_managers.first().full_name, payload['full_name'])

    def test_fund_manager_list_view(self):
        self.client.force_authenticate(self.user)
        self.fund.managers.create(full_name='John Wick', bio='Test bio', company=self.company)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], self.fund.managers.first().full_name)
