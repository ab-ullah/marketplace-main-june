from django.contrib.auth.models import Group

from api.partners.tests.factories import UserFactory, CompanyUserFactory, AdminUserFactory
from rest_framework.test import APITestCase, APIRequestFactory

from api.permissions.is_full_access_admin import IsFullAccessAdmin
from api.permissions.is_full_access_approver import IsFullAccessApprover
from api.permissions.has_full_readonly_access import HasFullReadonlyAccess
from api.users.constants import ADMIN_GROUP_NAME, APPROVER_GROUP_NAME, READONLY_GROUP_NAME
from api.users.views.user_views import UserInfoAPIView


class ProvisionUsersTestCase(APITestCase):

    def setUp(self):
        self.user = UserFactory()

        factory = APIRequestFactory()
        self.request = factory.post('/info/')
        self.view = UserInfoAPIView.as_view()
        self.request.user = self.user

    @staticmethod
    def assign_group_to_user(user, group_name):
        _group = Group.objects.get(name=group_name)
        user.groups.add(_group)

    def assign_full_admin_role_to_user(self):
        admin_user = AdminUserFactory()
        self.request.user = admin_user.user
        self.assign_group_to_user(admin_user, ADMIN_GROUP_NAME)

    def assign_full_approver_role_to_user(self):
        company_user = CompanyUserFactory()
        self.request.user = company_user.user
        self.assign_group_to_user(self.request.user, APPROVER_GROUP_NAME)

    def assign_full_readonly_role_to_user(self):
        company_user = CompanyUserFactory()
        self.request.user = company_user.user
        self.assign_group_to_user(self.request.user, READONLY_GROUP_NAME)

    def test_full_admin_access_forbidden(self):
        self.assertFalse(IsFullAccessAdmin().has_permission(self.request, self.view))

    def test_full_approver_access_forbidden(self):
        self.assertFalse(IsFullAccessApprover().has_permission(self.request, self.view))

    def test_full_readonly_access_forbidden(self):
        self.assertFalse(HasFullReadonlyAccess().has_permission(self.request, self.view))

    def test_full_admin_access_allowed(self):
        self.assign_full_admin_role_to_user()
        self.assertTrue(IsFullAccessAdmin().has_permission(self.request, self.view))

    def test_full_approver_allowed(self):
        self.assign_full_approver_role_to_user()
        self.assertTrue(IsFullAccessApprover().has_permission(self.request, self.view))

    def test_full_readonly_access_allowed(self):
        self.assign_full_readonly_role_to_user()
        self.assertTrue(HasFullReadonlyAccess().has_permission(self.request, self.view))
