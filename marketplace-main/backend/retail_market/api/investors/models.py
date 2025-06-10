import uuid

from django.db import models
from django.db.models import Q, UniqueConstraint
from django.utils import timezone

from api.currencies.services.currency_rate import CurrencyRateService
from api.models import BaseModel
from simple_history.models import HistoricalRecords
from django.utils.translation import gettext_lazy as _


class RequestStatusChoice(models.IntegerChoices):
    PENDING = 1, _('Pending')
    ACCEPTED = 2, _('Accepted')
    DENIED = 3, _('Denied')
    COMPLETED = 4, _('Completed')


class Investor(BaseModel):
    class VehicleTypeChoice(models.IntegerChoices):
        INDIVIDUAL = 1, _('Individual')
        ENTITY = 2, _('Entity')

    leverage_used = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    name = models.CharField(max_length=120)
    partner_id = models.CharField(
        max_length=250,
        db_index=True,
        unique=True,
        null=True
    )
    investor_account_code = models.CharField(max_length=250, db_index=True, unique=True)
    vehicle_type = models.PositiveSmallIntegerField(
        choices=VehicleTypeChoice.choices,
        null=True,
        blank=True
    )
    history = HistoricalRecords()

    def get_investor_user(self):
        investor_user_profile = self.associated_users.order_by('role').first()
        if investor_user_profile:
            return investor_user_profile.company_user.user
        return None

    def get_investor_currency(self):
        user = self.get_investor_user()
        if user:
            employment_record = user.employment_record()
            if employment_record:
                return employment_record.currency
        return None


class CompanyUserInvestor(BaseModel):
    class InvestorRoleChoices(models.IntegerChoices):
        MANAGER = 1, _('Manager')
        PRIMARY_USER = 2, _('Primary User')
        SECONDARY_USER = 3, _('Secondary User')

    company_user = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.CASCADE,
        related_name='associated_investor_profiles'
    )
    investor = models.ForeignKey(
        'Investor',
        on_delete=models.CASCADE,
        related_name='associated_users'
    )
    role = models.PositiveSmallIntegerField(
        choices=InvestorRoleChoices.choices,
        default=InvestorRoleChoices.MANAGER.value
    )

    class Meta:
        unique_together = ('company_user', 'investor')


class FundInvestor(BaseModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_investors')
    investor = models.ForeignKey('Investor', on_delete=models.CASCADE, related_name='invested_funds')
    share_class = models.CharField(max_length=250, null=True, blank=True)
    investment_id = models.CharField(max_length=250, null=True, blank=True)

    initial_leverage_ratio = models.FloatField(default=0)
    current_leverage_ratio = models.FloatField(default=0)

    latest_transaction_date = models.DateTimeField(null=True, blank=True)

    purchase_price = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    commitment_to_date = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    uncalled_amount = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    total_distributions = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_used_for_loan = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_used_for_interest = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_recallable = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_to_employee = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    pending_distributions = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    leverage_used = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    loan_balance_with_unpaid_interest = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    loan_balance = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    current_interest_rate = models.FloatField(default=0)
    interest_accrued = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    interest_paid = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    unpaid_interest = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    loan_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    gross_share_of_investment_product = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    commitment_amount = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    equity_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    offset_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    unfunded_capital_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    management_fee = models.DecimalField(max_digits=18, decimal_places=8, default=0)


    loan_called = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    cash_called = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    equity_called = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    offset_called = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    approved_for_recycling = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    total_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    total_commitment_including_recycling = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    unfunded_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    drop_loan_to_value = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    drop_leverage_ratio = models.FloatField(null=True, blank=True)

    never_will_be_called = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    called_to_date = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    current_net_equity = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    fund_ownership_percent = models.FloatField(default=0)
    fund_nav_date = models.DateField(null=True, blank=True)

    nav_share = models.DecimalField(max_digits=21, decimal_places=9, default=0)
    remaining_equity = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    gain = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    unrealized_gain = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    currency = models.ForeignKey(
        'currencies.Currency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='currency_fund_investors'
    )

    leveraged_irr = models.FloatField(default=0)
    un_leveraged_irr = models.FloatField(default=0)

    last_nav_update = models.DateTimeField(null=True, blank=True)
    capital_calls_since_last_nav = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributions_calls_since_last_nav = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    return_of_capital = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    profit_distributions = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    loan_drawn = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    loan_repayment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    gross_distributions_recallable_to_date = models.DecimalField(max_digits=18, decimal_places=8, default=0)

    order = models.ForeignKey(
        'FundOrder',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_allocations'
    )

    deleted = models.BooleanField(default=False)

    def get_currency_conversion_rate(self, source_currency):
        if not source_currency:
            return None

        if not self.fund.company.allow_multiple_currencies_in_portfolio():
            return None

        currency_info = {
            'currency': source_currency.code,
            'symbol': source_currency.symbol,
            'conversion_rate': 0,
        }

        conversion_service = CurrencyRateService(
            from_currency=self.fund.fund_currency,
            to_currency=source_currency,
            date=self.latest_transaction_date.date() if self.latest_transaction_date else timezone.now().date()
        )

        conversion_rate = conversion_service.get_conversion_rate()
        if conversion_rate:
            currency_info['conversion_rate'] = conversion_rate
        return currency_info

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=('fund', 'investor', 'investment_id', 'latest_transaction_date'),
                condition=Q(deleted=False),
                name='unique_fund_investment'
            )
        ]


class FundOrder(BaseModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_orders')
    investor = models.ForeignKey('Investor', on_delete=models.CASCADE, related_name='invested_orders')
    handled_by = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.SET_NULL,
        related_name='handled_fund_orders',
        null=True,
        blank=True
    )
    used_role_leverage = models.ForeignKey('companies.CompanyRole', null=True, blank=True, on_delete=models.SET_NULL)
    requested_allocation = models.DecimalField(max_digits=18, decimal_places=8)
    requested_leverage = models.DecimalField(max_digits=18, decimal_places=8)
    approved_allocation = models.DecimalField(max_digits=18, decimal_places=8, null=True, blank=True)
    status = models.PositiveSmallIntegerField(
        choices=RequestStatusChoice.choices,
        default=RequestStatusChoice.PENDING.value
    )

    class Meta:
        ordering = ("-created_at",)


class FundSale(BaseModel):
    sold_by = models.ForeignKey('Investor', on_delete=models.CASCADE, related_name='investor_sales')
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_sales')
    purchased_by = models.ForeignKey(
        'Investor',
        on_delete=models.CASCADE,
        related_name='purchased_sales',
        null=True,
        blank=True
    )
    requested_sale = models.DecimalField(max_digits=18, decimal_places=8)
    status = models.PositiveSmallIntegerField(
        choices=RequestStatusChoice.choices,
        default=RequestStatusChoice.PENDING.value
    )


class FundSaleOffer(BaseModel):
    sale = models.ForeignKey(
        'FundSale',
        on_delete=models.CASCADE,
        related_name='sale_offers'
    )
    offered_by = models.ForeignKey('Investor', on_delete=models.CASCADE, related_name='fund_purchase_offers')
    offer_amount = models.DecimalField(max_digits=18, decimal_places=8)
    leverage_requested = models.DecimalField(max_digits=18, decimal_places=8)
    status = models.PositiveSmallIntegerField(
        choices=RequestStatusChoice.choices,
        default=RequestStatusChoice.PENDING.value
    )


class InvestorAdvisor(BaseModel):
    advisor = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.CASCADE,
        related_name='associated_advisor_investors'
    )
    investor = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.CASCADE,
        related_name='associated_investor_advisors'
    )

    class Meta:
        unique_together = ('advisor', 'investor')
