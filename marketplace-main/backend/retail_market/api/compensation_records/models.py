from django.db import models
from django.db.models import Q

from api.models import BaseModel, EncryptedDecimalField


class CompensationRecord(BaseModel):
    user = models.ForeignKey(
        'users.RetailUser',
        related_name='compensation_records',
        on_delete=models.CASCADE
    )
    company = models.ForeignKey(
        'companies.Company',
        related_name='company_compensation_records',
        on_delete=models.CASCADE
    )
    currency = models.ForeignKey(
        "currencies.Currency",
        on_delete=models.DO_NOTHING
    )
    year = models.PositiveIntegerField()
    deleted = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user_id',
                    'company_id',
                    'year',
                ],
                condition=Q(deleted=False),
                name="unique_compensation_records"
            )
        ]


class Cash(BaseModel):
    compensation_record = models.OneToOneField(
        'CompensationRecord',
        on_delete=models.CASCADE,
        related_name='cash'
    )
    salary = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    bonus = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    extra_bonus = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    match_401k = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)


class InsuranceBenefit(BaseModel):
    compensation_record = models.OneToOneField(
        'CompensationRecord',
        on_delete=models.CASCADE,
        related_name='insurance_benefits'
    )
    medical = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    dental = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    vision = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    life = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    ad_and_d = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    std = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    ltd = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    supplemental_ltd = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)


class MiscellaneousBenefit(BaseModel):
    compensation_record = models.OneToOneField(
        'CompensationRecord',
        on_delete=models.CASCADE,
        related_name='misc_benefits'
    )
    phone = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    meals = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    parking = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)


class CompensationTax(BaseModel):
    compensation_record = models.OneToOneField(
        'CompensationRecord',
        on_delete=models.CASCADE,
        related_name='taxes'
    )
    fica = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    medicare = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    futa = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
    sui = EncryptedDecimalField(max_digits=18, decimal_places=8, default=0)
