import uuid

from api.admin_users.models import AdminUser
from api.companies.models import Company, CompanyUser
from api.users.constants import ADMIN_GROUP_NAME
from api.users.models import RetailUser
from django.contrib.auth.models import Group


class CreateAdminUserService:
    def __init__(self, email: str, company_name: str, title: str = ''):
        self.email = email
        self.company_name = company_name
        self.title = title

    def create(self):
        try:
            company = Company.objects.get(
                name__iexact=self.company_name
            )
        except Company.DoesNotExist:
            print(f'No company found with name: {self.company_name}')
            return None

        retail_user, _ = RetailUser.objects.get_or_create(
            email__iexact=self.email,
            defaults={
                'email': self.email,
                'username': self.email
            }
        )

        admin_user, _ = AdminUser.objects.get_or_create(
            company=company,
            user=retail_user,
            defaults={
                'title': self.title
            }
        )
        CompanyUser.objects.get_or_create(
            user=retail_user,
            company=company,
            defaults={
                'partner_id': uuid.uuid4().hex
            }
        )
        if not retail_user.groups.filter(name=ADMIN_GROUP_NAME).exists():
            full_access_admin_group = Group.objects.get(name=ADMIN_GROUP_NAME)
            retail_user.groups.add(full_access_admin_group)
        return admin_user
