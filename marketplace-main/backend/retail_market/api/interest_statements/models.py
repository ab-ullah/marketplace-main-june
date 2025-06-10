from django.db import models
from django.utils.translation import gettext_lazy as _

from api.models import BaseModel


class StatusChoice(models.IntegerChoices):
    SUCCESS = 1, _('Success')
    FAILURE = 2, _('Failure')


class ProcessingReasonChoice(models.IntegerChoices):
    FIRST_PROCESSED = 1, _('First Processed')
    FORCED_PROCESSED = 2, _('Forced Processed')


class StateChoice(models.IntegerChoices):
    STARTED = 1, _('Started')
    IN_PROGRESS = 2, _('In Progress')
    COMPLETED = 3, _('Completed')
    FAILED = 4, _('Failed')


class InterestStatement(BaseModel):
    investor_id = models.ForeignKey('investors.Investor', on_delete=models.CASCADE)
    fund_id = models.ForeignKey('funds.Fund', on_delete=models.CASCADE)
    process_id = models.ForeignKey('interest_statements.ProcessState', on_delete=models.CASCADE)
    quarter = models.CharField(max_length=120, db_index=True)
    reason = models.PositiveSmallIntegerField(choices=ProcessingReasonChoice.choices)
    status = models.PositiveSmallIntegerField(choices=StatusChoice.choices)

    class Meta:
        unique_together = (
            'investor_id',
            'fund_id',
            'process_id'
        )


class ProcessState(BaseModel):
    process_id = models.UUIDField(primary_key=True, db_index=True)
    process_name = models.CharField(max_length=120)
    state = models.PositiveSmallIntegerField(choices=StateChoice.choices)
    description = models.TextField(max_length=250)
    created_by = models.ForeignKey('admin_users.AdminUser', on_delete=models.CASCADE)


class InvestorInterestStatement(BaseModel):
    investor = models.ForeignKey(
        'investors.Investor',
        on_delete=models.CASCADE,
        related_name='investor_interest_statements'
    )
    statement_date = models.DateField()
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE
    )

    class Meta:
        unique_together = (
            'investor',
            'statement_date'
        )

    def get_full_name(self):
        return self.investor.name
