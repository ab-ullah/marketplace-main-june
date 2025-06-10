import uuid

from django.utils import timezone
from slugify import slugify

from api.companies.models import Company, CompanyUser
from api.constants.currencies import CURRENCIES
from api.currencies.models import Currency, CurrencyRate
from api.funds.models import Fund, FundNav
from api.geographics.models import Country
from api.investors.models import CompanyUserInvestor, Investor, FundInvestor
from api.users.models import RetailUser


class LoadDummyDataService:
    def __init__(
            self,
            retail_user_model: RetailUser,
            fund_model: Fund,
            company_model: Company,
            company_user_model: CompanyUser,
            company_user_investor_model: CompanyUserInvestor,
            investor_model: Investor,
            fund_investor_model: FundInvestor,
            currency_model: Currency,
            country_model: Country,
            fund_nav_model: FundNav,
            currency_rate: CurrencyRate
    ):
        self.retail_user_model = retail_user_model
        self.fund_model = fund_model
        self.company_model = company_model
        self.company_user_model = company_user_model
        self.company_user_investor_model = company_user_investor_model
        self.investor_model = investor_model
        self.fund_investor_model = fund_investor_model
        self.currency_model = currency_model
        self.country_model = country_model
        self.fund_nav_model = fund_nav_model
        self.currency_rate = currency_rate

    def create_currencies(self, company):
        for currency_data in CURRENCIES:
            self.currency_model.objects.get_or_create(
                code=currency_data['code'].upper(),
                company=company,
                defaults={
                    'company': company,
                    **currency_data
                }
            )

    def get_user(self, email: str):
        retail_user, _ = self.retail_user_model.objects.get_or_create(
            email__iexact=email,
            defaults={
                'email': email,
                'username': email
            }
        )
        return retail_user

    def get_company_user(self, company: Company, user: RetailUser):
        company_user, _ = self.company_user_model.objects.get_or_create(
            user=user,
            company=company,
            defaults={
                'partner_id': uuid.uuid4().hex
            }
        )
        return company_user

    def get_company_user_investor(self, company_user, investor_name, investor_account_code):
        investor, _ = self.investor_model.objects.get_or_create(
            investor_account_code=investor_account_code,
            defaults={
                'partner_id': uuid.uuid4().hex,
                'name': investor_name,
            }
        )

        self.company_user_investor_model.objects.get_or_create(
            company_user=company_user,
            investor=investor
        )

        return investor

    def get_company(self, company_name):
        company = self.company_model.objects.get(name__iexact=company_name)
        return company

    def get_fund(
            self,
            currency_code,
            company,
            fund_name,
            fund_symbol,
            minimum_investment_amount,
            investment_product_code
    ):
        currency = self.currency_model.objects.get(
            code__iexact=currency_code,
            company=company
        )
        country, _ = self.country_model.objects.get_or_create(
            iso_code='US',
            defaults={'name': 'United States'}
        )

        fund_data = {
            'name': fund_name,
            'slug': slugify(fund_name),
            'raw_investment_product_code': investment_product_code,
            'company': company,
            'fund_currency': currency,
            'minimum_investment': minimum_investment_amount,
            'domicile': country,
            'symbol': fund_symbol,
            'partner_id': uuid.uuid4().hex,
            'is_published': True,
            'publish_investment_details': True
        }

        fund, _ = self.fund_model.objects.get_or_create(
            slug=fund_data['slug'],
            company=company,
            defaults=fund_data
        )
        return fund

    def create_fund_nav(self, fund_nav_amount, fund: Fund, nav_date):
        self.fund_nav_model.objects.create(
            company=fund.company,
            fund=fund,
            nav=fund_nav_amount,
            as_of=nav_date
        )

    def get_fund_investor(self, fund, investor, investment_data):
        self.fund_investor_model.objects.update_or_create(
            fund=fund,
            investor=investor,
            defaults=investment_data
        )

    def create_conversion_rate(self, fund: Fund, rate: float):
        usd = self.currency_model.objects.get(
            code__iexact='USD',
            company=fund.company
        )
        fund_currency = fund.fund_currency
        self.currency_rate.objects.create(
            from_currency=fund_currency,
            to_currency=usd,
            rate_date=timezone.now().date(),
            conversion_rate=rate
        )

    def process(
            self,
            email: str,
            company_name: str,
            fund_data,
            investment_data,
            investor_name,
            investor_account_code
    ):
        company = self.get_company(company_name=company_name)
        user = self.get_user(email=email)
        company_user = self.get_company_user(company=company, user=user)
        investor = self.get_company_user_investor(
            company_user=company_user,
            investor_name=investor_name,
            investor_account_code=investor_account_code
        )
        conversion_rate = fund_data.pop('conversion_rate', None)
        fund = self.get_fund(
            company=company,
            currency_code=fund_data['currency_code'],
            fund_name=fund_data['name'],
            fund_symbol=fund_data['symbol'],
            minimum_investment_amount=fund_data['minimum_investment_amount'],
            investment_product_code=fund_data['investment_product_code']
        )
        if conversion_rate:
            self.create_conversion_rate(fund=fund, rate=conversion_rate)
        self.create_fund_nav(
            fund_nav_amount=fund_data.get('nav_amount'),
            fund=fund,
            nav_date=fund_data['fund_nav_date']
        )
        self.get_fund_investor(
            fund=fund,
            investor=investor,
            investment_data=investment_data
        )
