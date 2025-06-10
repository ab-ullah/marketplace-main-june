import factory
from faker import Faker

from api.cards.default.workflow_types import WorkflowTypes
from api.cards.models import Workflow as CardWorkFlow
from api.kyc_records.models import KYCRecord
from api.partners.tests.factories import UserFactory, CompanyFactory, CompanyUserFactory

fake = Faker()


class CardWorkFlowFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CardWorkFlow
        django_get_or_create = ('slug', 'company')

    name = factory.LazyAttribute(lambda x: fake.unique.company())
    slug = factory.SelfAttribute('name')
    is_published = True
    company = factory.SubFactory(CompanyFactory)
    type = CardWorkFlow.FLOW_TYPES.ELEGIBILITY.value


class KYCRecordFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = KYCRecord
        exclude = ('company_user',)

    user = factory.SubFactory(UserFactory)
    company = factory.SubFactory(CompanyFactory)
    # We would not allow the creation of a KYC record for a user who was not associated to the company.
    # Either because they were created by the API or invited to invest.
    company_user = factory.SubFactory(
        CompanyUserFactory,
        company=factory.SelfAttribute('..company'),
        user=factory.SelfAttribute('..user')
    )
    workflow = factory.SubFactory(
        CardWorkFlowFactory,
        company=factory.SelfAttribute('..company'),
        type=CardWorkFlow.FLOW_TYPES.KYC.value,
    )
    first_name = factory.LazyAttribute(lambda x: fake.unique.name())
    last_name = factory.LazyAttribute(lambda x: fake.unique.name())


class KYCRecordWithoutCompanyUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = KYCRecord

    user = factory.SubFactory(UserFactory)
    company = factory.SubFactory(CompanyFactory)
    workflow = factory.SubFactory(
        CardWorkFlowFactory,
        company=factory.SelfAttribute('..company'),
        type=CardWorkFlow.FLOW_TYPES.KYC.value,
    )
    first_name = factory.LazyAttribute(lambda x: fake.unique.name())
    last_name = factory.LazyAttribute(lambda x: fake.unique.name())
