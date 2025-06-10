from django.urls import reverse
from rest_framework import status
from api.partners.tests.factories import UserFactory
from core.base_tests import BaseTestCase


class TestAdminViewsAccess(BaseTestCase):

    def setUp(self):
        self.create_user()

    def test_view_access_as_admin_user(self):
        self.client.force_authenticate(self.admin_user.user)
        url = reverse('admin-company-retrieve-update-view')
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_view_access_as_retail_user(self):
        user = UserFactory()
        self.client.force_authenticate(user)
        url = reverse('admin-company-retrieve-update-view')
        response = self.client.get(url, **self.get_headers())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)