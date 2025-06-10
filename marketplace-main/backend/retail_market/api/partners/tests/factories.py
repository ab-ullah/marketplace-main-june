import datetime
import uuid

import factory
from faker import Faker

from api.admin_users.models import AdminUser
from api.backup.models import DynamoFund
from api.companies.models import Company, CompanyUser, CompanyProfile, CompanyFundVehicle
from api.currencies.models import Currency
from api.funds.models import Fund, ExternalOnboarding, DocumentFilter, FundShareClass, FundTag, LeverageOption
from api.investors.models import Investor, CompanyUserInvestor, FundInvestor
from api.users.models import RetailUser
from api.workflows.models import WorkFlow

fake = Faker()


class CompanyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Company

    name = factory.LazyAttribute(lambda x: fake.unique.company())


class CompanyFundVehicleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CompanyFundVehicle

    company = factory.SubFactory(CompanyFactory)
    name = factory.LazyAttribute(lambda x: fake.unique.catch_phrase()[0:49])


class CurrencyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Currency
        django_get_or_create = ('code', 'company')

    company = factory.SubFactory(CompanyFactory)
    code = 'USD'
    name = 'US Dollar'
    symbol = '$'


class FundFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Fund

    name = factory.LazyAttribute(lambda x: fake.unique.company())
    company = factory.SubFactory(CompanyFactory)
    partner_id = factory.Sequence(lambda n: 'partner{0}'.format(n))
    investment_product_code = factory.Sequence(lambda n: 'partner_code_{0}'.format(n))
    symbol = factory.Sequence(lambda n: 'Fund{0}'.format(n))
    slug = factory.SelfAttribute('name')
    fund_type = Fund.FundTypeChoice.OPEN.value
    fund_currency = factory.SubFactory(CurrencyFactory, company=factory.SelfAttribute('..company'))
    business_line = Fund.BusinessLineChoice.AMERICAS_PRIVATE.value
    is_published = False
    target_fund_size = 10_000_000
    firm_co_investment_commitment = 500_000
    external_id = factory.Sequence(lambda n: 'xtrnl-id-{0}'.format(n))


class FundTagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundTag

    name = factory.LazyAttribute(lambda x: fake.unique.company())
    slug = factory.SelfAttribute('name')
    company = factory.SubFactory(CompanyFactory)


class LeverageOptionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = LeverageOption

    amount = 2.0
    description = "some description"
    fund = factory.SubFactory(FundFactory)

class FundShareClassFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundShareClass

    legal_name = 'A'
    display_name = 'A'
    description = 'my share class'


class ExternalOnboardingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ExternalOnboarding

    fund = factory.SubFactory(FundFactory)
    url = "https://www.factorycreatedurl.com"


class DynamoFundFactory(factory.django.DjangoModelFactory):

    class Meta:
        model = DynamoFund

    fund = factory.SubFactory(FundFactory)
    dynamo_id = factory.LazyAttribute(uuid.uuid4)


class DocumentFilterFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DocumentFilter

    fund = factory.SubFactory(FundFactory)


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RetailUser

    username = factory.LazyAttribute(lambda x: fake.unique.name())
    email = factory.LazyAttribute(lambda x: fake.unique.email())
    is_sidecar_admin = False


class AdminUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AdminUser

    user = factory.SubFactory(UserFactory)
    company = factory.SubFactory(CompanyFactory)


class WorkFlowFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = WorkFlow

    name = factory.LazyAttribute(lambda x: fake.unique.company())
    company = factory.SubFactory(CompanyFactory)
    created_by = factory.SubFactory(
        AdminUserFactory,
        user=factory.SubFactory(UserFactory),
        company=factory.SelfAttribute('..company')
    )
    workflow_type = WorkFlow.WorkFlowTypeChoices.REVIEW.value
    module = WorkFlow.WorkFlowModuleChoices.INDICATION_OF_INTEREST.value
    parent = None
    step = 0
    is_completed = False


class InvestorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Investor

    name = factory.LazyAttribute(lambda x: fake.unique.company())
    partner_id = factory.Sequence(lambda n: 'investorpartner{0}'.format(n))
    investor_account_code = factory.Sequence(lambda n: 'investor-code-{0}'.format(n))


class FundInvestorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FundInvestor

    fund = factory.SubFactory(FundFactory)
    investor = factory.SubFactory(InvestorFactory)
    latest_transaction_date = factory.LazyFunction(datetime.datetime.now)


class CompanyUserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CompanyUser

    company = factory.SubFactory(CompanyFactory)
    user = factory.SubFactory(UserFactory)
    partner_id = factory.Sequence(lambda n: 'user-partner{0}'.format(n))


class CompanyProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CompanyProfile
        django_get_or_create = ('company',)

    company = factory.SubFactory(CompanyFactory)
    program_name = "Employee Co-Investment Program"
    contact_email = "test-support@sidecar.aws"
    mission_statement = "The greatest investment opportunities"


class CompanyUserInvestorFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CompanyUserInvestor

    company_user = factory.SubFactory(CompanyUserFactory)
    investor = factory.SubFactory(InvestorFactory)
