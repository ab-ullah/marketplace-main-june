import factory

from api.admin_users.tests.factories import AdminUserFactory
from api.partners.tests.factories import CompanyFactory, UserFactory, WorkFlowFactory
from api.workflows.models import Task


class CompanyUserTaskFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Task

    assigned_to = factory.SubFactory(
        AdminUserFactory,
        user=factory.SubFactory(UserFactory),
        company=factory.SubFactory(CompanyFactory),
    )
    workflow = factory.SubFactory(
        WorkFlowFactory,
        company=factory.SubFactory(CompanyFactory)
    )
