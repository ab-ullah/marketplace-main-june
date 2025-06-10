import factory

from api.admin_users.models import AdminUser
from api.partners.tests.factories import CompanyFactory, UserFactory


class AdminUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AdminUser

    company = factory.SubFactory(CompanyFactory)
    user = factory.SubFactory(UserFactory)
