from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from api.admin_users.services.admin_user_service import CreateAdminUserService
from api.partners.tests.factories import UserFactory, CompanyUserFactory, CompanyFactory, FundFactory


class TestGroupListView(APITestCase):

    @classmethod
    def setUpClass(cls):
        super(TestGroupListView, cls).setUpClass()
        cls.user = UserFactory()
        cls.company = CompanyFactory()
        cls.company_user = CompanyUserFactory(company=cls.company)
        CreateAdminUserService(email=cls.user.email, company_name=cls.company.name).create()
        cls.url = reverse('admin-company-group-list')

    def test_group_list_with_non_admin_user(self):
        self.client.force_authenticate(self.company_user.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_group_list_with_admin_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), Group.objects.all().count())


class TestAddGroupUsersAPIView(APITestCase):

    @classmethod
    def setUpClass(cls):
        super(TestAddGroupUsersAPIView, cls).setUpClass()
        cls.user = UserFactory()
        cls.company = CompanyFactory()
        cls.company_user = CompanyUserFactory(company=cls.company)
        cls.group = Group.objects.create(name='Test Group')
        cls.admin_user = CreateAdminUserService(email=cls.user.email, company_name=cls.company.name).create()
        cls.url = reverse('admin-add-group-users-view', kwargs={'pk': cls.group.id})

    def test_group_add_user_with_non_admin_user(self):
        self.client.force_authenticate(self.company_user.user)
        response = self.client.patch(self.url, data={'user_ids': [self.company_user.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_group_add_user_with_invalid_user_id(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(self.url, data={'admin_ids': [374673467]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_group_add_user_with_admin_user(self):
        self.client.force_authenticate(self.user)
        self.assertNotIn(self.group, self.user.groups.all())
        response = self.client.patch(self.url, data={'admin_ids': [self.admin_user.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.group, self.admin_user.groups.all())
