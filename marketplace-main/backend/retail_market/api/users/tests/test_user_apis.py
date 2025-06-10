from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.reverse import reverse

from api.documents.models import Document
from api.partners.tests.factories import CompanyUserFactory, UserFactory, AdminUserFactory, CompanyFactory
from api.users.models import RetailUser
from core.base_tests import BaseTestCase


class TestAdminUserAPIs(BaseTestCase):

    def setUp(self):
        self.create_user()

    def test_get_users_list(self):
        company_user_1 = CompanyUserFactory(company=self.company)
        other_company_user_1 = CompanyUserFactory()

        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-users-list-view')
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        fetched_ids = [u['id'] for u in response.data]
        self.assertTrue(self.user.id in fetched_ids)
        self.assertTrue(company_user_1.user.id in fetched_ids)
        self.assertFalse(other_company_user_1.user.id in fetched_ids)

    def test_delete_user(self):
        RetailUser.objects.all().delete()
        company = CompanyFactory()
        user = UserFactory()
        AdminUserFactory(company=company, user=user)
        company_user_1 = CompanyUserFactory(company=company)
        email = company_user_1.user.email
        self.client.force_authenticate(user)

        self.assertTrue(RetailUser.objects.filter(email=email).exists())
        self.assertEqual(RetailUser.objects.count(), 2)

        url = reverse('admin-users-delete-view', kwargs={'pk': company_user_1.user.id})
        self.client.delete(url, **self.get_headers())
        self.assertEqual(RetailUser.objects.count(), 1)
        self.assertEqual(RetailUser.include_deleted.count(), 2)
        self.assertFalse(RetailUser.objects.filter(email=email).exists())

    def test_get_all_users_list(self):
        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-all-users-list-view')
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        fetched_ids = [u['id'] for u in response.data]
        self.assertTrue(self.admin_user.user.id in fetched_ids)

    def test_update_user_groups_with_company_user(self):
        self.client.force_authenticate(self.company_user.user)
        url = reverse('admin-update-user-view', kwargs={'pk': self.user.id})
        group = Group.objects.create(name='Test Group')
        response = self.client.patch(url, data={'group_ids': [group.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_user_groups_with_admin_user(self):
        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-update-user-view', kwargs={'pk': self.admin_user.user.id})
        group = Group.objects.create(name='Test Group')
        response = self.client.patch(url, data={'group_ids': [group.id]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['groups']), 1)
        self.assertEqual(response.data['groups'][0]['name'], group.name)
        self.assertEqual(self.admin_user.groups.first(), group)
