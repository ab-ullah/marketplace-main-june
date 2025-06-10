import uuid

from django.db import models

from api.models import BaseModel


class DistributionNotice(BaseModel):
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_distribution_notices')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='company_distribution_notices')
    created_timestamp = models.DateField()
    approved_at = models.DateTimeField(null=True, blank=True)
    distribution_date = models.DateTimeField(null=True, blank=True)
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
        related_name='workflow_distribution_notice'
    )

    class Meta:
        ordering = ('-created_at',)


class DistributionNoticeDetail(BaseModel):
    user = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.CASCADE,
        related_name='user_distribution_notice_details'
    )
    amount = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    investments = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    ownership = models.DecimalField(max_digits=13, decimal_places=6, null=True, blank=True)
    management_fees = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    organization_cost = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    fund_expenses = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    total_to_date = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    total_amount_due = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    partner_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    previously_contributed = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    interest = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    unpaid_commitment = models.DecimalField(max_digits=13, decimal_places=3, null=True, blank=True)
    distribution_notice = models.ForeignKey(
        DistributionNotice,
        on_delete=models.CASCADE,
        related_name='distribution_notice_details'
    )
    document = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='distribution_notice_detail'
    )

    class Meta:
        ordering = ('-created_at',)
