from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.reverse import reverse

from api.partners.tests.factories import UserFactory, CompanyUserFactory, AdminUserFactory
from api.users.constants import ADMIN_GROUP_NAME
from core.base_tests import BaseTestCase


class TestAInviteAPIs(BaseTestCase):

    def setUp(self):
        self.create_user()

    def test_get_invite_user_list(self):
        full_access_admin_group = Group.objects.get(name=ADMIN_GROUP_NAME)
        url = reverse('admin-users-invites')
        self.client.force_authenticate(self.admin_user.user)

        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.admin_user.user.groups.add(full_access_admin_group)
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.admin_user.groups.add(full_access_admin_group)
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_participants_user_list(self):
        full_access_admin_group = Group.objects.get(name=ADMIN_GROUP_NAME)
        url = reverse('admin-users-participants')
        self.client.force_authenticate(self.admin_user.user)

        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.admin_user.user.groups.add(full_access_admin_group)
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.admin_user.groups.add(full_access_admin_group)
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # validate admin_id is not in response
        for item in response.data:
            self.assertNotEquals(item['id'], self.admin_user.user_id)
