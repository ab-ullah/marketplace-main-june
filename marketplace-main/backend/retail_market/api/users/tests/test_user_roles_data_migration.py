from django.contrib.auth.models import Group, Permission

from api.admin_users.tests.factories import AdminUserFactory
from api.partners.tests.factories import UserFactory, CompanyFactory
from api.users.constants import (
    PERMISSIONS, GROUPS, HAS_FULL_ADMIN_ACCESS_CODE, HAS_FULL_APPROVER_ACCESS_CODE,
    HAS_FULL_READONLY_ACCESS_CODE, ADMIN_GROUP_NAME, APPROVER_GROUP_NAME, READONLY_GROUP_NAME
)
from core.tests.base_migration_test import TestMigrations


class TagsTestCase(TestMigrations):

    migrate_from = '0006_alter_retailuser_email'
    migrate_to = '0007_auto_20220210_1248'

    def setUp(self):
        self.user_roles_permission_codes = [permission_code for permission_code, _ in PERMISSIONS]
        self.initial_roles_permissions = Permission.objects.filter(codename__in=self.user_roles_permission_codes).count()
        self.initial_groups = Group.objects.filter(name__in=GROUPS)

    def assert_no_user_roles(self):
        self.assertEqual(self.initial_groups, 0)
        self.assertEqual(self.initial_roles_permissions, 0)

    def setUpBeforeMigration(self, apps):

        self.assert_no_user_roles()

        self.user = UserFactory()
        self.company = CompanyFactory()
        self.admin_user = AdminUserFactory(user=self.user, company=self.company)

    def test_groups_existence(self):
        groups = Group.objects.filter(name__in=GROUPS)
        self.assertEqual(groups.count(), len(GROUPS))

    def test_permissions_existence(self):
        added_permissions = Permission.objects.filter(codename__in=self.user_roles_permission_codes).count()
        self.assertEqual(added_permissions, len(PERMISSIONS))

    def test_group_permissions(self):
        groups = Group.objects.filter(name__in=GROUPS)

        for group in groups:
            if group.name == ADMIN_GROUP_NAME:
                self.assertTrue(group.permissions.filter(codename=HAS_FULL_ADMIN_ACCESS_CODE).exists())
            elif group.name == APPROVER_GROUP_NAME:
                self.assertTrue(group.permissions.filter(codename=HAS_FULL_APPROVER_ACCESS_CODE).exists())
            elif group.name == READONLY_GROUP_NAME:
                self.assertTrue(group.permissions.filter(codename=HAS_FULL_READONLY_ACCESS_CODE).exists())
            else:
                pass
