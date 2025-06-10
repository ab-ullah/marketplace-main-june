import logging

from django.core.management.base import BaseCommand

from api.companies.models import Company, CompanyUser
from api.currencies.models import Currency, CurrencyRate
from api.funds.models import Fund, FundNav
from api.geographics.models import Country
from api.investors.models import CompanyUserInvestor, Investor, FundInvestor
from api.investors.services.demo_investment_data.data import AWESOME_OPPORTUNITY_FUND, AWESOME_OPPORTUNITY_INVESTMENT, \
    AWESOME_CORE_FUND, AWESOME_CORE_INVESTMENT
from api.investors.services.demo_investment_data.demo_investment_service import LoadDummyDataService
from api.users.models import RetailUser

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create Dummy Investment Data'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, action='store')
        parser.add_argument('--company_name', type=str, action='store')
        parser.add_argument('--investor_name', type=str, action='store')
        parser.add_argument('--investor_account_code', type=str, action='store')

    def handle(self, *args, **options):
        email = options.get('email')
        company_name = options.get('company_name')
        if not (email and company_name):
            print('Email and company name are required')
            return

        email_handle = email.split('@')[0]
        investor_name = options.get('investor_name')
        investor_account_code = options.get('investor_account_code')

        if not investor_name:
            investor_name = email_handle

        if not investor_account_code:
            investor_account_code = email_handle

        data_service = LoadDummyDataService(
            retail_user_model=RetailUser,
            fund_model=Fund,
            company_model=Company,
            company_user_model=CompanyUser,
            company_user_investor_model=CompanyUserInvestor,
            investor_model=Investor,
            fund_investor_model=FundInvestor,
            currency_model=Currency,
            country_model=Country,
            fund_nav_model=FundNav,
            currency_rate=CurrencyRate
        )
        data_service.process(
            email=email,
            company_name=company_name,
            fund_data=AWESOME_OPPORTUNITY_FUND,
            investment_data=AWESOME_OPPORTUNITY_INVESTMENT,
            investor_name=investor_name,
            investor_account_code=investor_account_code
        )

        data_service.process(
            email=email,
            company_name=company_name,
            fund_data=AWESOME_CORE_FUND,
            investment_data=AWESOME_CORE_INVESTMENT,
            investor_name=investor_name,
            investor_account_code=investor_account_code
        )