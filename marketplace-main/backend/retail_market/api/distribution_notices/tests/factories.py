import factory
from django.utils import timezone

from api.distribution_notices.models import (DistributionNotice,
                                             DistributionNoticeDetail)
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import (CompanyFactory, FundFactory,
                                          UserFactory)


class DistributionNoticeFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DistributionNotice

    company = factory.SubFactory(CompanyFactory)
    fund = factory.SubFactory(FundFactory)
    document = factory.SubFactory(DocumentFactory)
    created_timestamp = timezone.now()


class DistributionNoticeDetailFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DistributionNoticeDetail

    distribution_notice = factory.SubFactory(DistributionNoticeFactory)
    user = factory.SubFactory(UserFactory)
    document = factory.SubFactory(DocumentFactory)

    amount = factory.Faker('pyint', min_value=0, max_value=1000)
    investments = factory.Faker('pyint', min_value=0, max_value=1000)
    ownership = factory.Faker('pyint', min_value=0, max_value=1000)
    management_fees = factory.Faker('pyint', min_value=0, max_value=1000)
    organization_cost = factory.Faker('pyint', min_value=0, max_value=1000)
    fund_expenses = factory.Faker('pyint', min_value=0, max_value=1000)
    total_to_date = factory.Faker('pyint', min_value=0, max_value=1000)
    total_amount_due = factory.Faker('pyint', min_value=0, max_value=1000)
    partner_commitment = factory.Faker('pyint', min_value=0, max_value=1000)
    total_amount_due = factory.Faker('pyint', min_value=0, max_value=1000)
    interest = factory.Faker('pyint', min_value=0, max_value=1000)
    unpaid_commitment = factory.Faker('pyint', min_value=0, max_value=1000)