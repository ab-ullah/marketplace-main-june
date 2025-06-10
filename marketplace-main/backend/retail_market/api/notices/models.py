from django.db import models

from api.models import BaseModel
from core.managers.has_company_filter_manager import HasCompanyFilterManager
from django.utils.translation import gettext_lazy as _


class Quarters(models.IntegerChoices):
    Q1 = 1, _('Q1'),
    Q2 = 2, _('Q2'),
    Q3 = 3, _('Q3'),
    Q4 = 4, _('Q4'),


class TransactionalConsideration(BaseModel):
    objects = HasCompanyFilterManager()
    fund = models.ForeignKey(
        'funds.Fund',
        on_delete=models.CASCADE,
        related_name='fund_transactional_considerations'
    )
    firm = models.ForeignKey(
        'firms.Firm',
        on_delete=models.CASCADE,
        related_name='firm_transactional_considerations'
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_transactional_considerations'
    )
    investor = models.ForeignKey(
        'investors.Investor',
        on_delete=models.CASCADE,
        related_name='investor_transactional_considerations'
    )
    notice_date = models.DateField(db_index=True)
    quarter = models.PositiveSmallIntegerField(choices=Quarters.choices)
    capital_called = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    distributed = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    other_activity = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    net_transaction = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    non_taxable = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    ltcg = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    stcg = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    ordinary = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    dividend = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    character_unknown = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    total_taxable = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    conversion_rate = models.FloatField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'fund_id',
                    'firm_id',
                    'investor_id',
                    'notice_date',
                ],
                name="unique_transactional_considerations"
            )
        ]


class ValuationConsideration(BaseModel):
    objects = HasCompanyFilterManager()
    fund = models.ForeignKey(
        'funds.Fund',
        on_delete=models.CASCADE,
        related_name='fund_valuation_considerations'
    )
    firm = models.ForeignKey(
        'firms.Firm',
        on_delete=models.CASCADE,
        related_name='firm_valuation_considerations'
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='company_valuation_considerations'
    )
    investor = models.ForeignKey(
        'investors.Investor',
        on_delete=models.CASCADE,
        related_name='investor_valuation_considerations'
    )
    quarter = models.PositiveSmallIntegerField(choices=Quarters.choices)
    notice_date = models.DateField(db_index=True, null=True)
    reported_fair_market_value = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    leverage_fund_line = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    net_asset_value = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    adjusted_values = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    net_asset_value_usd = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    reported_unfunded = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    unfunded_commitment = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    unfunded_commitment_usd = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    conversion_rate = models.FloatField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'fund_id',
                    'firm_id',
                    'investor_id',
                    'notice_date'
                ],
                name="unique_valuation_considerations"
            )
        ]
