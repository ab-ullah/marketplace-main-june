from django.db import models
from django.utils.translation import gettext_lazy as _

from api.companies.models import Company
from api.models import BaseModel


class FundActivity(BaseModel):
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='company_fund_activities')
    transaction_date = models.DateTimeField()

    investor_account_code = models.CharField(max_length=250, db_index=True)
    investment_product_code = models.CharField(max_length=250, db_index=True)

    leverage_ratio = models.CharField(max_length=250, null=True, blank=True)
    share_class = models.CharField(max_length=250, null=True, blank=True)
    investment_id = models.CharField(max_length=250, null=True, blank=True)
    raw_investment_product_code = models.CharField(max_length=250, null=True, blank=True)

    equity_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    equity_called_to_date = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    commitment_amount = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    outstanding_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    income_distributions = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    leveraged_irr = models.FloatField(default=0)
    unleveraged_irr = models.FloatField(default=0)
    current_leverage_rate = models.FloatField(default=0)
    initial_leverage_rate = models.FloatField(default=0)
    current_interest_rate = models.FloatField(default=0)
    fund_ownership = models.FloatField(default=0)
    capital_called_since_last_nav = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_since_inception = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_since_last_nav = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    return_of_capital = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    profit_distributions = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_used_for_loan = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_used_for_interest = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_recallable = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_to_employee = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    unrealized_gain_loss = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    gain_loss = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    called_to_date = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    gross_share_of_nav = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    gross_distributions_recallable_to_date = models.DecimalField(max_digits=18, decimal_places=8, default=0)


class LoanActivity(BaseModel):
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='company_loan_activities')
    transaction_date = models.DateTimeField()

    investor_account_code = models.CharField(max_length=250, db_index=True)
    investment_product_code = models.CharField(max_length=250, db_index=True)
    leverage_ratio = models.CharField(max_length=250, null=True, blank=True)
    share_class = models.CharField(max_length=250, null=True, blank=True)
    investment_id = models.CharField(max_length=250, null=True, blank=True)
    raw_investment_product_code = models.CharField(max_length=250, null=True, blank=True)

    loan_drawn = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    loan_repayment = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    loan_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    loan_balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    interest_balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    interest_repay_income = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    interest_repay_capital = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    interest_paid_to_date = models.DecimalField(max_digits=18, decimal_places=8, default=0)


class TransactionDetail(BaseModel):
    class TransactionDetailStatus(models.IntegerChoices):
        DRAFT = 1, _('Draft')
        FINALIZED = 2, _('Finalized')

    class TransactionDetailType(models.IntegerChoices):
        UNKNOWN_TRANSACTION_TYPE = 0, _('Unknown Transaction Type')
        CONTRIBUTION_BRIDGING_LOAN = 1, _('Contribution Bridging Loan')
        CONTRIBUTION_ESCROW = 2, _('Contribution Escrow')
        CONTRIBUTION_ESCROW_PAYDOWN = 3, _('Contribution Escrow Paydown')
        CONTRIBUTION_LOAN = 4, _('Contribution Loan')
        CONTRIBUTION = 5, _('Contribution')
        DISTRIBUTION_DIVIDEND_CAPITAL_GAIN = 6, _('Distribution Dividend Capital Gain')
        DISTRIBUTION_DIVIDEND_LOAN_REPAY_CAPITAL = 7, _('Distribution Dividend Loan Repay Capital')
        DISTRIBUTION_DIVIDEND_LOAN_REPAY_INCOME = 8, _('Distribution Dividend Loan Repay Income')
        DISTRIBUTION_DIVIDEND_INCOME = 9, _('Distribution Dividend Income')
        DISTRIBUTION_DIVIDEND_INTEREST_REPAY_CAPITAL = 10, _("Distribution Dividend Interest Repay Capital")
        DISTRIBUTION_DIVIDEND_INTEREST_REPAY_INCOME = 11, _('Distribution Dividend Interest Repay Income')
        FAIR_VALUE_ADJUSTMENT = 12, _("Fair Value Adjustment")
        INITIAL_COMMITMENT = 13, _("Initial Commitment")
        INTEREST = 14, _("Interest")
        LATE_FEE_CHARGED = 15, _("Late Fee Charged")
        LATE_FEE_PAYMENT = 16, _("Late Fee Payment")
        CONTRIBUTION_RECALLABLE_DISTRIBUTION = 17, _("Contribution Recallable Distribution")
        DISTRIBUTION_DIVIDEND_LOAN_REPAY_REDEMPTION = 18, _("Distribution Dividend Loan Repay Redemption")
        DISTRIBUTION_DIVIDEND_INTEREST_REPAY_REDEMPTION = 19, _("Distribution Dividend Interest Repay Redemption")
        DISTRIBUTION_DIVIDEND_RECALLABLE = 20, _("Distribution Dividend Recallable")
        FOLLOW_ON_COMMITMENT = 21, _("Follow on Commitment")
        REDEMPTION = 22, _("Redemption")

        @staticmethod
        def transaction_string_to_type(company: Company, type_number: int):
            """Look up a customers ledger transaction type and convert it to the sidecar standard
            We pass the company id to make this future proof, although for now we are using the LaSalle versions
            of the transaction type numbers.
            """
            contrib_bridging_loan = 2
            contrib_escrow = 13
            contrib_loan = 1
            contrib_recallable_distribution = 10
            contribution = 3
            distrib_div_capital_gain = 12
            distrib_div_employee_loan_repay_capital = 5
            distrib_div_employee_loan_repay_income = 4
            distrib_div_employee_loan_repay_redemption = 21
            distrib_div_income = 11
            distrib_div_interest_repayment_capital = 8
            distrib_div_interest_repayment_income = 7
            distrib_div_interest_repayment_redemption = 20
            distrib_div_recallable = 9
            fair_value_adjustment = 16
            follow_on_commitment = 15
            initial_commitment = 14
            interest = 6
            redemption = 17
            late_fee_charged = 18
            late_fee_payment = 19
            contrib_escrow_paydown = 22

            if type_number == contrib_bridging_loan:
                return TransactionDetail.TransactionDetailType.CONTRIBUTION_BRIDGING_LOAN
            elif type_number == contrib_recallable_distribution:
                return TransactionDetail.TransactionDetailType.CONTRIBUTION_RECALLABLE_DISTRIBUTION
            elif type_number == distrib_div_employee_loan_repay_redemption:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_LOAN_REPAY_REDEMPTION
            elif type_number == distrib_div_interest_repayment_redemption:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_INTEREST_REPAY_REDEMPTION
            elif type_number == follow_on_commitment:
                return TransactionDetail.TransactionDetailType.FOLLOW_ON_COMMITMENT
            elif type_number == redemption:
                return TransactionDetail.TransactionDetailType.REDEMPTION
            elif type_number == distrib_div_recallable:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_RECALLABLE
            elif type_number == contrib_escrow:
                return TransactionDetail.TransactionDetailType.CONTRIBUTION_ESCROW
            elif type_number == contrib_escrow_paydown:
                return TransactionDetail.TransactionDetailType.CONTRIBUTION_ESCROW_PAYDOWN
            elif type_number == contrib_loan:
                return TransactionDetail.TransactionDetailType.CONTRIBUTION_LOAN
            elif type_number == contribution:
                return TransactionDetail.TransactionDetailType.CONTRIBUTION
            elif type_number == distrib_div_capital_gain:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_CAPITAL_GAIN
            elif type_number == distrib_div_employee_loan_repay_capital:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_LOAN_REPAY_CAPITAL
            elif type_number == distrib_div_employee_loan_repay_income:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_LOAN_REPAY_INCOME
            elif type_number == distrib_div_income:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_INCOME
            elif type_number == distrib_div_interest_repayment_capital:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_INTEREST_REPAY_CAPITAL
            elif type_number == distrib_div_interest_repayment_income:
                return TransactionDetail.TransactionDetailType.DISTRIBUTION_DIVIDEND_INTEREST_REPAY_INCOME
            elif type_number == fair_value_adjustment:
                return TransactionDetail.TransactionDetailType.FAIR_VALUE_ADJUSTMENT
            elif type_number == initial_commitment:
                return TransactionDetail.TransactionDetailType.INITIAL_COMMITMENT
            elif type_number == interest:
                return TransactionDetail.TransactionDetailType.INTEREST
            elif type_number == late_fee_charged:
                return TransactionDetail.TransactionDetailType.LATE_FEE_CHARGED
            elif type_number == late_fee_payment:
                return TransactionDetail.TransactionDetailType.LATE_FEE_PAYMENT
            else:
                return TransactionDetail.TransactionDetailType.UNKNOWN_TRANSACTION_TYPE

    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE,
                                related_name='company_transaction_details')
    # The combination of partner_id and company makes this transaction unique
    partner_id = models.CharField(max_length=250)
    investor = models.ForeignKey('investors.Investor', on_delete=models.CASCADE,
                                 related_name='investor_transaction_details')
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name="fund_transaction_details")

    # Make sure to sort by effective date AND partner_id to ensure that order is the same between systems.
    effective_date = models.DateField()
    transaction_type = models.PositiveSmallIntegerField(choices=TransactionDetailType.choices,
                                                        default=TransactionDetailType.UNKNOWN_TRANSACTION_TYPE.value)
    transaction_status = models.PositiveSmallIntegerField(choices=TransactionDetailStatus.choices,
                                                          default=TransactionDetailStatus.DRAFT.value)

    # Amounts will be in the currency of the fund.
    actual_transaction_amount = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['company', 'partner_id', 'investor_id', 'fund_id', 'transaction_type', 'effective_date'],
                                    name="unique_transaction_detail")
        ]

    def is_interest_repay_transaction(self):
        from api.activities.constants.transaction_type_groups import INTEREST_REPAY_TRANSACTION_TYPES
        return self.transaction_type in INTEREST_REPAY_TRANSACTION_TYPES

    def is_acceptable_transaction(self):
        from api.activities.constants.transaction_type_groups import ACCEPTABLE_TRANSACTION_TYPES
        return self.transaction_type in ACCEPTABLE_TRANSACTION_TYPES

    def is_loan_repay_transaction(self):
        from api.activities.constants.transaction_type_groups import LOAN_REPAY_TRANSACTION_TYPES
        return self.transaction_type in LOAN_REPAY_TRANSACTION_TYPES

    def is_contribution_loan_transaction(self):
        from api.activities.constants.transaction_type_groups import CONTRIBUTION_LOAN_TRANSACTION_TYPES
        return self.transaction_type in CONTRIBUTION_LOAN_TRANSACTION_TYPES

    def is_interest_transaction(self):
        from api.activities.constants.transaction_type_groups import INTEREST_TRANSACTIONS
        return self.transaction_type in INTEREST_TRANSACTIONS
