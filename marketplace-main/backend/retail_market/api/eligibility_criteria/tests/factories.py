import json

import factory
from django.utils import timezone
from faker import Faker

from api.applications.models import Application
from api.eligibility_criteria.models import (
    EligibilityCriteriaResponse, CriteriaBlockResponse, CriteriaBlock, Block, BlockCategory, FundEligibilityCriteria,
    InvestmentAmount
)
from api.investors.models import Investor
from api.partners.tests.factories import (
    CompanyUserFactory, CompanyFactory, FundFactory, CurrencyFactory, AdminUserFactory, UserFactory, WorkFlowFactory
)

fake = Faker()


class FundEligibilityCriteriaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundEligibilityCriteria

    fund = factory.SubFactory(
        FundFactory,
        company=factory.SubFactory(CompanyFactory),
        fund_currency=factory.SubFactory(CurrencyFactory, company=factory.SubFactory(CompanyFactory)),
    )
    created_by = factory.SubFactory(
        AdminUserFactory,
        user=factory.SubFactory(UserFactory),
        company=factory.SubFactory(CompanyFactory)
    )
    investor_type = Investor.VehicleTypeChoice.INDIVIDUAL.value
    status = FundEligibilityCriteria.CriteriaStatusChoice.PUBLISHED.value
    last_modified = factory.Faker("date_time", tzinfo=timezone.get_current_timezone())
    workflow = factory.SubFactory(
        WorkFlowFactory,
        company=factory.SubFactory(CompanyFactory),
        created_by=factory.SelfAttribute('..created_by')
    )


class InvestmentAmountFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = InvestmentAmount

    amount = 20000000
    leverage_ratio = 3


class FundEligibilityCriteriaResponseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = EligibilityCriteriaResponse

    response_by = factory.SubFactory(CompanyUserFactory)
    criteria = factory.SubFactory(FundEligibilityCriteriaFactory)
    investment_amount = factory.SubFactory(InvestmentAmountFactory)
    is_eligible = True


class BlockCategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = BlockCategory

    company = factory.SubFactory(CompanyFactory)


class BlockFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Block

    company = factory.SubFactory(CompanyFactory)
    category = factory.SubFactory(BlockCategoryFactory)


class CriteriaBlockFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CriteriaBlock

    block = factory.SubFactory(BlockFactory)
    criteria = factory.SubFactory(FundEligibilityCriteriaFactory)


class EligibilityCriteriaBlockResponseFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CriteriaBlockResponse

    criteria_response = factory.SubFactory(
        FundEligibilityCriteriaResponseFactory,
        response_by=factory.SubFactory(CompanyUserFactory),
        criteria=factory.SubFactory(FundEligibilityCriteriaFactory)
    )
    block = factory.SubFactory(
        CriteriaBlockFactory,
        block=factory.SubFactory(BlockFactory),
        criteria=factory.SubFactory(FundEligibilityCriteriaFactory)
    )
    response_json = {"eligibility_criteria_id": 1, "block_id": 2, "response_json": "{'a': 'ab'}"}


class ApplicationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Application

    user = factory.SubFactory(UserFactory)
    company = factory.SubFactory(CompanyFactory)
    fund = factory.SubFactory(FundFactory)
    eligibility_response = factory.SubFactory(
        FundEligibilityCriteriaResponseFactory,
        response_by=factory.SubFactory(CompanyUserFactory),
        criteria=factory.SubFactory(FundEligibilityCriteriaFactory)
    )
