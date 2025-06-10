from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from api.activities.models import LoanActivity, FundActivity
from api.activities.tests.factories import FundActivityFactory, LoanActivityFactory
from api.companies.services.company_service import LASALLE_COMPANY_NAME, CompanyService
from api.constants.headers import API_KEY_HEADER
from api.feature_flags.tests.factories import FeatureFactory, ActiveCompanyFeatureFactory
from api.investors.constants import INVESTMENT_HISTORIC_DATA
from api.investors.models import FundInvestor, Investor
from api.partners.tests.factories import FundFactory, InvestorFactory


class FundInvestorServiceTestCase(APITestCase):

    def setUp(self):
        Investor.objects.all().delete()
        FundInvestor.objects.all().delete()
        company_info = CompanyService.create_company(company_name=LASALLE_COMPANY_NAME)
        self.company = company_info['company']
        self.api_token = company_info['token']

    def get_headers(self):
        return {API_KEY_HEADER: self.api_token}

    def test_fund_investor_with_distributions(self):
        fund = FundFactory(company=self.company)
        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            initial_leverage_rate=0,
            distributions_since_inception=250,
            distributions_used_for_loan=100,
            distributions_used_for_interest=25,
            distributions_recallable=55,
            distributions_to_employee=250 - 100 - 25 - 55,
        )  # type: FundActivity

        # Fund_investor created since we have specified initial_leverage_rate is zero
        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = FundInvestor.objects.first()
        self.assertEqual(fund_investor.loan_commitment, 0)
        self.assertEqual(fund_investor.loan_balance, 0)
        self.assertEqual(fund_investor.interest_paid, 0)
        self.assertEqual(fund_investor.loan_balance_with_unpaid_interest, 0)
        self.assertEqual(fund_investor.distributions_used_for_loan, 100)
        self.assertEqual(fund_investor.distributions_used_for_interest, 25)
        self.assertEqual(fund_investor.distributions_recallable, 55)
        self.assertEqual(fund_investor.distributions_to_employee, 250 - 100 - 25 - 55)

    def test_net_equity_calculation(self):
        fund = FundFactory(company=self.company)
        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            initial_leverage_rate=0,
            gross_share_of_nav=200,
            capital_called_since_last_nav=50,
            distributions_since_last_nav=70,
            distributions_recallable=10,
        )  # type: FundActivity

        # Fund_investor created since we have specified initial_leverage_rate is zero
        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = FundInvestor.objects.first()
        self.assertEqual(fund_investor.loan_commitment, 0)
        self.assertEqual(fund_investor.loan_balance, 0)
        self.assertEqual(fund_investor.interest_paid, 0)
        self.assertEqual(fund_investor.current_net_equity, 200 + 50 - 70 + 10)

        loan_activity = LoanActivityFactory(
            transaction_date=timezone.now() + timedelta(days=3),
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            loan_balance=50,
            interest_balance=100,
            interest_paid_to_date=300,
            loan_drawn=6000,
            loan_repayment=3500,
        )

        fund_investor = FundInvestor.objects.first()
        self.assertEqual(fund_investor.current_net_equity, 200 - 50 - 100 + 50 - 70 + 10)

    def test_fund_investor_with_no_loan(self):
        fund = FundFactory(company=self.company)
        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            initial_leverage_rate=50,
        )  # type: FundActivity

        # No fund_investor created since we have specified initial_leverage_rate
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            initial_leverage_rate=0,
            gross_share_of_nav=200
        )  # type: FundActivity

        # Fund_investor created since we have specified initial_leverage_rate is zero
        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = FundInvestor.objects.first()
        self.assertEqual(fund_investor.loan_commitment, 0)
        self.assertEqual(fund_investor.loan_balance, 0)
        self.assertEqual(fund_investor.interest_paid, 0)
        self.assertEqual(fund_investor.loan_balance_with_unpaid_interest, 0)

        self.assertEqual(fund_investor.gross_share_of_investment_product, fund_activity.gross_share_of_nav)

        # Since loan is zero, net equity should equal gross share
        self.assertEqual(fund_investor.current_net_equity, fund_investor.gross_share_of_investment_product)

    def test_fund_investor_with_no_NAV(self):
        fund = FundFactory(company=self.company)
        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            initial_leverage_rate=0,
            gross_share_of_nav=0,
        )  # type: FundActivity

        # Fund_investor created since we have specified initial_leverage_rate is zero
        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = FundInvestor.objects.first()
        self.assertEqual(fund_investor.loan_commitment, 0)
        self.assertEqual(fund_investor.loan_balance, 0)
        self.assertEqual(fund_investor.interest_paid, 0)
        self.assertEqual(fund_investor.loan_balance_with_unpaid_interest, 0)

        self.assertEqual(fund_investor.gross_share_of_investment_product, fund_activity.gross_share_of_nav)

        # Since gross share is 0, net equity needs to be 0
        self.assertEqual(fund_investor.current_net_equity, 0)

        # since gross share is 0, gain needs to be 0, even though it was passed through
        self.assertEqual(fund_investor.gain, 0)

    def test_fund_investor_calculations(self):
        fund = FundFactory(company=self.company)
        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
        )  # type: FundActivity
        self.assertEqual(fund_investor_query.count(), 0)

        loan_activity = LoanActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
        )  # type: LoanActivity

        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = fund_investor_query.first()
        self.assertEqual(fund_investor.currency_id, fund.fund_currency_id)
        self.assertEqual(fund_investor.loan_commitment, loan_activity.loan_commitment)
        self.assertEqual(
            fund_investor.loan_balance_with_unpaid_interest,
            loan_activity.loan_balance + loan_activity.interest_balance
        )
        self.assertEqual(fund_investor.current_interest_rate, fund_activity.current_interest_rate)

        # Old activities should not affect
        older_date = timezone.now() - timedelta(days=4)
        fund_activity_old = FundActivityFactory(
            transaction_date=older_date,
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            current_interest_rate=5
        )  # type: FundActivity

        loan_activity_old = LoanActivityFactory(
            transaction_date=older_date,
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code
        )  # type: LoanActivity

        self.assertEqual(fund_investor_query.count(), 1)
        fund_investor = fund_investor_query.first()
        self.assertEqual(fund_investor.currency_id, fund.fund_currency_id)
        self.assertEqual(fund_investor.loan_commitment, loan_activity.loan_commitment)
        self.assertEqual(fund_investor.loan_balance, loan_activity.loan_balance)
        self.assertEqual(fund_investor.interest_paid, loan_activity.interest_paid_to_date)
        self.assertEqual(
            fund_investor.loan_balance_with_unpaid_interest,
            loan_activity.loan_balance + loan_activity.interest_balance
        )
        self.assertEqual(fund_investor.current_interest_rate, fund_activity.current_interest_rate)
        self.assertEqual(fund_investor.total_distributions, fund_activity.distributions_since_inception)
        self.assertEqual(fund_investor.equity_commitment, fund_activity.equity_commitment)
        self.assertEqual(fund_investor.equity_called, fund_activity.equity_called_to_date)
        self.assertEqual(fund_investor.return_of_capital, fund_activity.return_of_capital)
        self.assertEqual(fund_investor.profit_distributions, fund_activity.profit_distributions)

        # NEw activities should affect
        transaction_date = timezone.now() + timedelta(days=3)
        fund_activity_new = FundActivityFactory(
            transaction_date=transaction_date,
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            current_interest_rate=2,
            return_of_capital=6000,
            profit_distributions=7000,
            fund_ownership=0.12345678
        )  # type: FundActivity

        loan_activity_new = LoanActivityFactory(
            transaction_date=transaction_date,
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            loan_balance=2,
            interest_balance=600,
            interest_paid_to_date=300,
            loan_drawn=6000,
            loan_repayment=3500,
        )  # type: LoanActivity

        self.assertEqual(fund_investor_query.count(), 1)
        fund_investor = fund_investor_query.first()
        self.assertEqual(fund_investor.currency_id, fund.fund_currency_id)
        self.assertEqual(fund_investor.loan_commitment, loan_activity_new.loan_commitment)
        self.assertEqual(fund_investor.loan_repayment, loan_activity_new.loan_repayment)
        self.assertEqual(fund_investor.loan_drawn, loan_activity_new.loan_drawn)
        self.assertEqual(fund_investor.fund_ownership_percent, 0.12345678)
        self.assertEqual(
            fund_investor.loan_balance_with_unpaid_interest,
            loan_activity_new.loan_balance + loan_activity_new.interest_balance
        )
        self.assertEqual(fund_investor.current_interest_rate, fund_activity_new.current_interest_rate)
        self.assertEqual(fund_investor.return_of_capital, fund_activity_new.return_of_capital)
        self.assertEqual(fund_investor.profit_distributions, fund_activity_new.profit_distributions)
        self.assertEqual(
            fund_investor.interest_accrued,
            fund_investor.interest_paid + fund_investor.unpaid_interest
        )

    def test_fund_investor_calculations_legacy_import(self):
        fund = FundFactory(company=self.company)
        fund2 = FundFactory(company=self.company)

        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
        )  # type: FundActivity
        self.assertEqual(fund_investor_query.count(), 0)

        loan_activity = LoanActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
        )  # type: LoanActivity

        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = fund_investor_query.first()
        self.assertEqual(fund_investor.currency_id, fund.fund_currency_id)
        self.assertEqual(fund_investor.loan_commitment, loan_activity.loan_commitment)
        self.assertEqual(
            fund_investor.loan_balance_with_unpaid_interest,
            loan_activity.loan_balance + loan_activity.interest_balance
        )
        self.assertEqual(fund_investor.current_interest_rate, fund_activity.current_interest_rate)

        # Old activities for another fund will create new values

        fund_activity_old = FundActivityFactory(
            transaction_date=timezone.now() - timedelta(days=3),
            company=self.company,
            investment_product_code=fund2.investment_product_code,
            investor_account_code=investor.investor_account_code,
            current_interest_rate=5
        )  # type: FundActivity

        loan_activity_old = LoanActivityFactory(
            transaction_date=timezone.now() - timedelta(days=3),
            company=self.company,
            investment_product_code=fund2.investment_product_code,
            investor_account_code=investor.investor_account_code
        )  # type: LoanActivity

        fund_investor_query = FundInvestor.objects.filter(investor=investor)
        self.assertEqual(fund_investor_query.count(), 2)

    def test_fund_investor_historic_flow_latest_transaction_date(self):
        # Create and Activate Feature Flag
        investment_historic_feature = FeatureFactory.create(name=INVESTMENT_HISTORIC_DATA)
        ActiveCompanyFeatureFactory.create(
            feature=investment_historic_feature,
            company=self.company
        )

        fund = FundFactory(company=self.company)
        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            commitment_amount=9000,
            transaction_date=timezone.now() + timedelta(days=3)
        )
        self.assertEqual(fund_investor_query.count(), 0)

        loan_activity = LoanActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            transaction_date=timezone.now() + timedelta(days=3),
            loan_balance=400
        )

        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = fund_investor_query.first()
        self.assertEqual(fund_investor.loan_balance, 400)
        self.assertEqual(fund_investor.commitment_amount, 9000)

        # latest transaction date should be of loan_activity since its latest
        self.assertEqual(fund_investor.latest_transaction_date, loan_activity.transaction_date)

        latest_date = timezone.now() + timedelta(days=4)
        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            commitment_amount=19000,
            transaction_date=latest_date
        )
        self.assertEqual(fund_investor_query.count(), 2)

        fund_investor = fund_investor_query.last()
        self.assertEqual(fund_investor.commitment_amount, 19000)

        # latest transaction date should be of fund_activity now since its latest
        self.assertEqual(fund_investor.latest_transaction_date, fund_activity.transaction_date)
        self.assertEqual(fund_activity.transaction_date, latest_date)

        # create another fund activity with same datetime
        fund_activity = FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            commitment_amount=29000,
            transaction_date=latest_date
        )

        # existing fund_investor will be updated because of same datetime
        self.assertEqual(fund_investor_query.count(), 2)

        fund_investor = fund_investor_query.last()
        self.assertEqual(fund_investor.commitment_amount, 29000)
        self.assertEqual(fund_investor.latest_transaction_date, latest_date)

        latest_date = timezone.now() + timedelta(days=5)
        loan_activity = LoanActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            transaction_date=latest_date,
            loan_balance=1400
        )

        # new fund_investor will be created because transaction_date is increased
        self.assertEqual(fund_investor_query.count(), 3)

        fund_investor = fund_investor_query.last()
        self.assertEqual(fund_investor.loan_balance, 1400)
        self.assertEqual(fund_investor.latest_transaction_date, latest_date)

    def test_fund_investor_historic_flow_by_older_transaction_dates(self):
        # Create and Activate Feature Flag
        investment_historic_feature = FeatureFactory.create(name=INVESTMENT_HISTORIC_DATA)
        ActiveCompanyFeatureFactory.create(
            feature=investment_historic_feature,
            company=self.company
        )

        fund = FundFactory(company=self.company)
        investor = InvestorFactory()

        fund_investor_query = FundInvestor.objects.filter(fund=fund, investor=investor)
        self.assertEqual(fund_investor_query.count(), 0)

        FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            commitment_amount=9000,
            transaction_date=timezone.now()
        )
        self.assertEqual(fund_investor_query.count(), 0)

        LoanActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            transaction_date=timezone.now(),
            loan_balance=400
        )

        self.assertEqual(fund_investor_query.count(), 1)

        fund_investor = fund_investor_query.first()
        self.assertEqual(fund_investor.loan_balance, 400)
        self.assertEqual(fund_investor.commitment_amount, 9000)

        # test FundInvestor by populating activities with older dates
        old_date = timezone.now() - timedelta(days=2)
        FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            commitment_amount=19000,
            transaction_date=old_date
        )
        # no FundInvestor created since no loan activity exists for matching older date
        self.assertEqual(fund_investor_query.count(), 1)

        LoanActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            transaction_date=old_date,
            loan_balance=1400
        )
        self.assertEqual(fund_investor_query.count(), 2)
        fund_investor = fund_investor_query.last()
        self.assertEqual(fund_investor.commitment_amount, 19000)
        self.assertEqual(fund_investor.loan_balance, 1400)

        # Populate with latest dates again
        FundActivityFactory(
            company=self.company,
            investment_product_code=fund.investment_product_code,
            investor_account_code=investor.investor_account_code,
            commitment_amount=22000,
            transaction_date=timezone.now() + timedelta(days=12)
        )
        self.assertEqual(fund_investor_query.count(), 3)
        fund_investor = fund_investor_query.last()
        self.assertEqual(fund_investor.commitment_amount, 22000)
        # loan balance should be from most recent loan activity (not from the record created with older date)
        self.assertEqual(fund_investor.loan_balance, 400)
