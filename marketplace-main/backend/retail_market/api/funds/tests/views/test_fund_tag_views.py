from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.partners.tests.factories import UserFactory, CompanyUserFactory, CompanyFactory


class TestFundTagListCreateAPIView(APITestCase):

    @classmethod
    def setUpClass(cls):
        super(TestFundTagListCreateAPIView, cls).setUpClass()
        cls.user = UserFactory()
        cls.company = CompanyFactory()
        cls.company_user = CompanyUserFactory(company=cls.company)
        CreateAdminUserService(email=cls.user.email, company_name=cls.company.name).create()
        cls.url = reverse('fund-tag-list-create')

    def test_create_fund_tag_view_with_non_admin(self):
        self.client.force_authenticate(self.company_user.user)
        payload = {"name": "Fund Tag 1"}
        response = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_fund_tag_list_view_with_non_admin(self):
        self.client.force_authenticate(self.company_user.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_fund_tag_view(self):
        self.client.force_authenticate(self.user)
        payload = {"name": "Fund Tag 1"}
        response = self.client.post(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.company.company_fund_tags.count(), 1)
        self.assertEqual(self.company.company_fund_tags.first().name, payload["name"])

    def test_fund_tag_list_view(self):
        self.client.force_authenticate(self.user)
        payload = {"name": "Fund Tag 1"}
        self.client.post(self.url, data=payload, format='json')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], payload['name'])
