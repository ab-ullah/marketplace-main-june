import unittest
from datetime import timedelta

from django.utils import timezone

from api.companies.models import Company
from core.base_tests import Migrator, BaseTestCase


@unittest.skip("to be defined")
class MigrationTest(BaseTestCase):
    def setUp(self):
        self.migrator = Migrator()
        self.migrator.migrate("activities", "0008_rename_commitment_valuationconsideration_unfunded_commitment")

    def populate(self):
        Fund = self.migrator.apps.get_model("funds", "Fund")
        Firm = self.migrator.apps.get_model("firms", "Firm")
        Currency = self.migrator.apps.get_model("currencies", "Currency")
        Investor = self.migrator.apps.get_model("investors", "Investor")
        ValuationConsideration = self.migrator.apps.get_model("notices", "ValuationConsideration")

        if Company.objects.exists():
            company = Company.objects.first()
        else:
            company = Company.objects.create(
                name="Test company",
                sso_domains=[]
            )

        if Currency.objects.exists():
            currency = Currency.objects.first()
        else:
            currency = Currency.objects.create(
                company=company,
                code='USD',
                name='US Dollar',
                symbol='$',
            )

        if Fund.objects.exists():
            fund = Fund.objects.first()
            fund.investment_product_code = 'partner_code_0' if fund.investment_product_code is None else fund.investment_product_code
            fund.partner_id = 'partner0' if fund.partner_id is None else fund.partner_id
            fund.save()
        else:
            fund = Fund.objects.create(
                name="some fund name",
                company_id=company.id,
                partner_id='partner0',
                investment_product_code='partner_code_0',
                symbol=f'Fund0',
                slug="some-fund-name",
                fund_type=1,
                fund_currency=currency,
                business_line=1,
                is_published=False,
                target_fund_size=10_000_000,
                firm_co_investment_commitment=500_000)

        if Firm.objects.count() < 2:
            firm_1 = Firm.objects.create(
                name="some firm name",
                company_id=company.id,
                slug="some-firm-name",)
            firm_2 = Firm.objects.create(
                name="some firm name 2",
                company_id=company.id,
                slug="some-firm-name-2",)
        else:
            firm_1 = Firm.objects.all()[0]
            firm_2 = Firm.objects.all()[1]

        investor = Investor.objects.create(
            name="some investor name",
            partner_id='investorpartner0',
            investor_account_code='investor-code-0',
        )

        ValuationConsideration.objects.create(
            firm=firm_1,
            fund=fund,
            investor=investor,
            company=company,
            quarter=1,
        )

    def test_apply_new_formulae(self):
        self.populate()
        Fund = self.migrator.apps.get_model("funds", "Fund")
        FundInvestor = self.migrator.apps.get_model("investors", "FundInvestor")
        Investor = self.migrator.apps.get_model("investors", "Investor")
        fund = Fund.objects.first()
        investor = Investor.objects.filter(investor_account_code='investor-code-0').first()
        fund_investor = FundInvestor.objects.create(
            fund_id=fund.id,
            investor_id=investor.id,
            current_net_equity=200 - 50 - 100 + 50 - 70,
            gross_share_of_investment_product=200,
            distributions_calls_since_last_nav=70,
            distributions_recallable=10,
            capital_calls_since_last_nav=50,
            loan_balance=50,
            unpaid_interest=100,
        )

        self.migrator.migrate("activities", "0033_auto_data_migration_new_net_equity_formula")
        self.assertEqual(FundInvestor.objects.count(), 4)  # considering the ones already created
        fund_investor.refresh_from_db()
        self.assertEqual(fund_investor.current_net_equity, 200 - 50 - 100 + 50 - 70 + 10)

    @unittest.skip("Still not sure how to implement the unapply")
    def test_unapply_new_formulae(self):
        Fund = self.migrator.apps.get_model("funds", "Fund")
        FundInvestor = self.migrator.apps.get_model("investors", "FundInvestor")
        Investor = self.migrator.apps.get_model("investors", "Investor")
        self.populate()
        fund = Fund.objects.first()
        investor = Investor.objects.filter(investor_account_code='investor-code-0').first()
        fund_investor = FundInvestor.objects.create(
            fund_id=fund.id,
            investor_id=investor.id,
            current_net_equity=200 - 50 - 100 + 50 - 70,
            gross_share_of_investment_product=200,
            distributions_calls_since_last_nav=70,
            distributions_recallable=10,
            capital_calls_since_last_nav=50,
            loan_balance=50,
            unpaid_interest=100,
        )
        self.migrator.migrate("activities", "0033_auto_data_migration_new_net_equity_formula")
        self.migrator.migrate("activities", "0032_auto_20230731_2135")
        self.assertTrue(FundInvestor.objects.filter(
            current_net_equity=200 - 50 - 100 + 50 - 70
        ).exists())
