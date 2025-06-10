import logging
from decimal import Decimal
from typing import Union

from api.activities.models import FundActivity, LoanActivity
from api.documents.models import Document, InvestorDocument
from api.funds.models import Fund, FundNav
from api.investors.models import Investor, FundInvestor

logger = logging.getLogger()


class FundInvestorActivityService:
    def __init__(self, fund_activity: FundActivity, loan_activity: Union[LoanActivity, None]):
        self.fund_activity = fund_activity
        self.loan_activity = loan_activity
        self.fund_investor = self.get_fund_investor()
        self.fund_nav = self.get_fund_nav()

    def get_fund_nav(self):
        fund = self.fund_investor.fund
        try:
            return FundNav.objects.filter(fund=fund).latest('as_of')
        except FundNav.DoesNotExist:
            return None

    def get_fund_investor(self) -> FundInvestor:
        fund = Fund.objects.get(
            investment_product_code=self.fund_activity.investment_product_code,
            company=self.fund_activity.company
        )
        investor = Investor.objects.get(investor_account_code=self.fund_activity.investor_account_code)
        fund_investor, created = FundInvestor.objects.get_or_create(fund=fund, investor=investor, investment_id=self.fund_activity.investment_id)
        logger.debug(f"Fund {fund.id} - Investor {investor.id} - Investment Id: {self.fund_activity.investment_id} - created: {created}")
        return fund_investor

    # Do to fees between the feeder vehicle and fund, we can't
    # calculate gross share of nav solely from ownership percentage and
    # and fund NAV.
    def get_gross_share(self):
        return self.fund_activity.gross_share_of_nav

    # Don't allow for a net equity value unless there is a fund NAV
    def get_net_equity(self):
        # to be called after gross_share is updated
        loan_activity = self.loan_activity
        fund_investor = self.fund_investor
        loan_sum = loan_activity.loan_balance + loan_activity.interest_balance if loan_activity else 0
        if fund_investor.gross_share_of_investment_product > 0 or fund_investor.gross_share_of_investment_product < 0:
            return fund_investor.gross_share_of_investment_product - loan_sum + fund_investor.capital_calls_since_last_nav - fund_investor.distributions_calls_since_last_nav + fund_investor.distributions_recallable
        else:
            return 0

    # Don't allow for a gain loss unless there is a fund NAV
    # Fund NAV can be negative!
    def get_gain_loss(self, gain):
        gross_share_of_nav = self.get_gross_share()
        if gross_share_of_nav > 0 or gross_share_of_nav < 0:
            return gain
        return 0

    @staticmethod
    def get_first_capital_call(fund_investor: FundInvestor):
        investor = fund_investor.investor
        try:
            investor_document = investor.investor_documents.filter(
                fund=fund_investor.fund,
                document__document_type=Document.DocumentType.CAPITAL_CALL.value
            ).earliest('document__file_date')
            return investor_document.document.file_date
        except InvestorDocument.DoesNotExist:
            return None

    def get_currency(self):
        return self.fund_investor.fund.fund_currency

    def update_values(self):
        fund_activity = self.fund_activity
        loan_activity = self.loan_activity
        nav_amount = self.fund_nav.nav if self.fund_nav else 0

        self.fund_investor.unrealized_gain = fund_activity.unrealized_gain_loss
        self.fund_investor.called_to_date = fund_activity.called_to_date
        self.fund_investor.commitment_amount = fund_activity.commitment_amount
        self.fund_investor.uncalled_amount = fund_activity.commitment_amount - fund_activity.called_to_date
        self.fund_investor.current_interest_rate = fund_activity.current_interest_rate
        self.fund_investor.current_leverage_ratio = fund_activity.current_leverage_rate
        self.fund_investor.initial_leverage_ratio = fund_activity.initial_leverage_rate
        self.fund_investor.fund_ownership_percent = fund_activity.fund_ownership
        self.fund_investor.distributions_calls_since_last_nav = fund_activity.distributions_since_last_nav
        self.fund_investor.total_distributions = fund_activity.distributions_since_inception

        self.fund_investor.return_of_capital = fund_activity.return_of_capital

        self.fund_investor.profit_distributions = fund_activity.profit_distributions
        self.fund_investor.distributions_used_for_loan = fund_activity.distributions_used_for_loan
        self.fund_investor.distributions_used_for_interest = fund_activity.distributions_used_for_interest
        self.fund_investor.distributions_recallable = fund_activity.distributions_recallable
        self.fund_investor.distributions_to_employee = fund_activity.distributions_to_employee

        self.fund_investor.leveraged_irr = fund_activity.leveraged_irr
        self.fund_investor.un_leveraged_irr = fund_activity.unleveraged_irr

        self.fund_investor.equity_commitment = fund_activity.equity_commitment
        self.fund_investor.equity_called = fund_activity.equity_called_to_date
        self.fund_investor.remaining_equity = fund_activity.equity_commitment - fund_activity.equity_called_to_date

        self.fund_investor.fund_nav_date = self.fund_nav.as_of if self.fund_nav else None
        self.fund_investor.gain = self.get_gain_loss(fund_activity.gain_loss)

        if loan_activity:
            self.fund_investor.loan_commitment = loan_activity.loan_commitment
            self.fund_investor.loan_balance = loan_activity.loan_balance
            self.fund_investor.loan_balance_with_unpaid_interest = loan_activity.loan_balance + loan_activity.interest_balance

            self.fund_investor.interest_paid = loan_activity.interest_paid_to_date
            self.fund_investor.unpaid_interest = loan_activity.interest_balance
            self.fund_investor.interest_accrued = loan_activity.interest_balance + loan_activity.interest_paid_to_date
            self.fund_investor.loan_drawn = loan_activity.loan_drawn
            self.fund_investor.loan_repayment = loan_activity.loan_repayment

        self.fund_investor.capital_calls_since_last_nav = fund_activity.capital_called_since_last_nav
        self.fund_investor.nav_share = nav_amount * Decimal(fund_activity.fund_ownership)
        self.fund_investor.latest_transaction_date = fund_activity.transaction_date
        self.fund_investor.gross_distributions_recallable_to_date = fund_activity.gross_distributions_recallable_to_date

        self.fund_investor.gross_share_of_investment_product = self.get_gross_share()
        self.fund_investor.current_net_equity = self.get_net_equity()

        self.fund_investor.currency = self.get_currency()
        self.fund_investor.share_class = fund_activity.share_class

        self.fund_investor.save()


class FundInvestorActivityServiceHistoricData(FundInvestorActivityService):
    def __init__(self, fund_activity: FundActivity, loan_activity: Union[LoanActivity, None],
                 old_transaction_date=None):
        self.fund_activity = fund_activity
        self.loan_activity = loan_activity
        self.fund_investor = self.get_fund_investor(old_transaction_date)
        self.fund_nav = self.get_fund_nav()

    def get_fund_investor(self, old_transacation_date) -> FundInvestor:
        fund = Fund.objects.get(
            investment_product_code=self.fund_activity.investment_product_code,
            company=self.fund_activity.company
        )
        investor = Investor.objects.get(investor_account_code=self.fund_activity.investor_account_code)

        created = False
        transaction_date = old_transacation_date
        if not transaction_date:
            transaction_date = self.get_latest_transaction_date()

        fund_investor = FundInvestor.objects.filter(
            fund=fund,
            investor=investor,
            investment_id=self.fund_activity.investment_id,
            latest_transaction_date=transaction_date
        )
        if fund_investor:
            fund_investor = fund_investor.first()

        else:
            fund_investor = FundInvestor.objects.create(
                fund=fund,
                investor=investor,
                investment_id=self.fund_activity.investment_id
            )
            created = True

        self.latest_transaction_date = transaction_date
        logger.debug(
            f"Fund {fund.id} - Investor {investor.id} - Investment Id: {self.fund_activity.investment_id} - created: {created}")
        return fund_investor

    def get_latest_transaction_date(self):
        latest_date = self.fund_activity.transaction_date
        if self.loan_activity:
            latest_date = max(latest_date, self.loan_activity.transaction_date)
        return latest_date

    def update_values(self):
        super().update_values()
        self.fund_investor.latest_transaction_date = self.latest_transaction_date
        self.fund_investor.save()
