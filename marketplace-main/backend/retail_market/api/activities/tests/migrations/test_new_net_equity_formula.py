import unittest
from datetime import timedelta

from django.utils import timezone

from api.companies.models import Company
from api.companies.services.company_service import LASALLE_COMPANY_NAME
from core.base_tests import Migrator, BaseTestCase


@unittest.skip("no longer necessary")
class MigrationTest(BaseTestCase):
    def setUp(self):
        self.migrator = Migrator()
        self.migrator.migrate("activities", "0032_auto_20230731_2135")

    def populate(self):
        Fund = self.migrator.apps.get_model("funds", "Fund")
        Currency = self.migrator.apps.get_model("currencies", "Currency")
        if Company.objects.exists():
            company = Company.objects.first()
        else:
            company = Company.objects.create(
                name=LASALLE_COMPANY_NAME,
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
                name="some name",
                company_id=company.id,
                partner_id='partner0',
                investment_product_code='partner_code_0',
                symbol=f'Fund0',
                slug="some name",
                fund_type=1,
                fund_currency=currency,
                business_line=1,
                is_published=False,
                target_fund_size=10_000_000,
                firm_co_investment_commitment=500_000)

        Investor = self.migrator.apps.get_model("investors", "Investor")

        investor = Investor.objects.create(
            name="some investor name",
            partner_id='investorpartner0',
            investor_account_code='investor-code-0',
        )

        LoanActivity = self.migrator.apps.get_model("activities", "LoanActivity")
        FundActivity = self.migrator.apps.get_model("activities", "FundActivity")
        fund.investment_product_code = 'partner_code_0'
        fund_activity = FundActivity.objects.create(
            initial_leverage_rate=0,
            gross_share_of_nav=200,
            capital_called_since_last_nav=50,
            distributions_since_last_nav=70,
            distributions_recallable=10,
            transaction_date=timezone.now(),
            equity_commitment=7000,
            equity_called_to_date=3000,
            commitment_amount=9000,
            outstanding_commitment=4000,
            income_distributions=500,
            leveraged_irr=40,
            unleveraged_irr=60,
            current_leverage_rate=25,
            current_interest_rate=12,
            fund_ownership=1550,
            return_of_capital=5000,
            profit_distributions=4000,
            unrealized_gain_loss=1000,
            called_to_date=2000,
            gain_loss=4000,
            company_id=company.id,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            distributions_since_inception=250,
            distributions_used_for_loan=100,
            distributions_used_for_interest=25,
            distributions_to_employee=0,
        )
        loan_activity = LoanActivity.objects.create(
            company_id=company.id,
            loan_commitment=1000,
            interest_repay_income=500,
            interest_repay_capital=200,
            transaction_date=timezone.now() + timedelta(days=3),
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            interest_paid_to_date=300,
            loan_drawn=6000,
            loan_repayment=3500,
            loan_balance=50,
            interest_balance=100,
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
