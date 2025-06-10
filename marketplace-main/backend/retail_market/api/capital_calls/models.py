import uuid

from django.db import models

from api.models import BaseModel, CurrencyConversionModel
from django.utils.translation import gettext_lazy as _


class CommitmentChoices(models.TextChoices):
    Cash = 'cash', _('Other')
    Offset = 'offset', _('Offset')


class CapitalCall(CurrencyConversionModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_capital_calls')
    company_user = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.CASCADE,
        related_name='user_capital_calls'
    )
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='company_capital_calls')
    fund_investor = models.ForeignKey(
        'investors.FundInvestor',
        on_delete=models.CASCADE,
        related_name='investor_capital_calls'
    )
    due_date = models.DateField()
    call_amount = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    deal_name = models.CharField(max_length=255, null=True, blank=True)
    number = models.IntegerField(null=True, blank=True)
    commitment_type = models.CharField(choices=CommitmentChoices.choices, max_length=255, null=True, blank=True)
    capital_call_type = models.CharField(max_length=255, null=True, blank=True)
    cash_called = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    loan_called = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    offset_called = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    management_fee_amount = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    total_called = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)


    deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ('-number', '-id')


class Distribution(CurrencyConversionModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_distributions')
    company_user = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.CASCADE,
        related_name='user_distributions'
    )
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='company_distributions')
    fund_investor = models.ForeignKey(
        'investors.FundInvestor',
        on_delete=models.CASCADE,
        related_name='investor_distributions'
    )
    due_date = models.DateField()
    call_amount = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)

    cash_returned = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    loan_returned = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    offset_returned = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    cash_loan_offset_gain = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    due_for_gp_loan = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    total_proceeds = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    recallable = models.FloatField(null=True, blank=True)

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    deal_name = models.CharField(max_length=255, null=True, blank=True)
    number = models.IntegerField(null=True, blank=True)
    is_recallable = models.BooleanField(default=True)
    deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ('-number', '-id')



class Commitment(CurrencyConversionModel):
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='company_commitments')
    fund_investor = models.ForeignKey(
        'investors.FundInvestor',
        on_delete=models.CASCADE,
        related_name='investor_commitments'
    )
    company_user = models.ForeignKey(
        'companies.CompanyUser',
        on_delete=models.CASCADE,
        related_name='user_commitments'
    )
    total_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    cash_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    offset_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    loan_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ('-created_at',)


class FundCapitalCall(BaseModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='capital_calls_funds')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='capital_calls_company')
    due_date = models.DateField(null=True, blank=True)
    created_timestamp = models.DateField()
    approved_at = models.DateTimeField(null=True, blank=True)
    document = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    workflow = models.OneToOneField(
        'workflows.WorkFlow',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workflow_capital_call'
    )

    class Meta:
        ordering = ('-created_at',)


class CapitalCallDetail(BaseModel):
    user = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.CASCADE,
        related_name='capital_call_user_detail'
    )
    amount = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    fulfilled_from_loan = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    investor_obligation = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    investment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    management_fees = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    organization_cost = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    fund_expenses = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    total_to_date = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    partner_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    previously_contributed = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    total_amount_due = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    unpaid_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    capital_call = models.ForeignKey(
        FundCapitalCall,
        on_delete=models.CASCADE,
        related_name='capital_call_details'
    )
    notice = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='capital_call_detail'
    )

    def get_full_name(self):
        return self.user.get_full_name()

    def get_fund_name(self):
        return self.capital_call.fund.name
