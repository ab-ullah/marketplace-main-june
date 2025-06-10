import factory
from django.utils import timezone

from api.capital_calls.models import (CapitalCall, CapitalCallDetail,
                                      FundCapitalCall)
from api.documents.tests.factories import DocumentFactory
from api.partners.tests.factories import (CompanyFactory, CompanyUserFactory,
                                          FundFactory, FundInvestorFactory,
                                          UserFactory)


class CapitalCallFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CapitalCall

    fund = factory.SubFactory(FundFactory)
    company_user = factory.SubFactory(CompanyUserFactory)
    company = factory.SubFactory(CompanyFactory)
    fund_investor = factory.SubFactory(FundInvestorFactory)
    due_date = timezone.now()


class FundCapitalCallFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundCapitalCall

    company = factory.SubFactory(CompanyFactory)
    fund = factory.SubFactory(FundFactory)
    document = factory.SubFactory(DocumentFactory)
    created_timestamp = timezone.now()


class CapitalCallDetailFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CapitalCallDetail

    capital_call = factory.SubFactory(FundCapitalCallFactory)
    user = factory.SubFactory(UserFactory)
    notice = factory.SubFactory(DocumentFactory)
    amount = factory.Faker('pyint', min_value=0, max_value=1000)
    fulfilled_from_loan = factory.Faker('pyint', min_value=0, max_value=1000)
    investor_obligation = factory.Faker('pyint', min_value=0, max_value=1000)
    investment = factory.Faker('pyint', min_value=0, max_value=1000)
    management_fees = factory.Faker('pyint', min_value=0, max_value=1000)
    organization_cost = factory.Faker('pyint', min_value=0, max_value=1000)
    fund_expenses = factory.Faker('pyint', min_value=0, max_value=1000)
    total_to_date = factory.Faker('pyint', min_value=0, max_value=1000)
    partner_commitment = factory.Faker('pyint', min_value=0, max_value=1000)
    previously_contributed = factory.Faker('pyint', min_value=0, max_value=1000)
    total_amount_due = factory.Faker('pyint', min_value=0, max_value=1000)
    unpaid_commitment = factory.Faker('pyint', min_value=0, max_value=1000)