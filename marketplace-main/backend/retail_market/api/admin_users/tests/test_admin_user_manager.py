from django.test import TestCase

from core.managers.has_company_filter_manager import HasCompanyFilterManager
from api.admin_users.models import AdminUser
from api.partners.tests.factories import AdminUserFactory, CompanyFactory

class TestHasCompanyFilterManager(TestCase):
    def setUp(self):
        self.company = CompanyFactory()
        self.admin_user = AdminUserFactory(company=self.company)

    def test_get_without_company_filter(self):
        with self.assertRaises(ValueError) as ctx:
            AdminUser.objects.get(id=self.admin_user.id)

        self.assertEqual(str(ctx.exception), HasCompanyFilterManager.ERROR_MSG)

    def test_get_with_company_filter(self):
        admin_user = AdminUser.objects.get(company=self.company, id=self.admin_user.id)
        self.assertEqual(admin_user, self.admin_user)

    # def test_all_without_company_filter(self):
    #     with self.assertRaises(ValueError) as ctx:
    #         AdminUser.objects.all()
    #     self.assertEqual(str(ctx.exception), HasCompanyFilterManager.ERROR_MSG)

    def test_filter_without_company_filter(self):
        with self.assertRaises(ValueError) as ctx:
            AdminUser.objects.filter(title__isnull=False)
        self.assertEqual(str(ctx.exception), HasCompanyFilterManager.ERROR_MSG)

    def test_filter_with_company_filter(self):
        qs = AdminUser.objects.filter(company=self.company)
        self.assertEqual(qs.count(), 1)
        self.assertEqual(qs.first(), self.admin_user)
