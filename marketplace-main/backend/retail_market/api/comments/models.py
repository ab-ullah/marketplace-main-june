from django.db import models

from api.models import BaseModel
from simple_history.models import HistoricalRecords
from django.utils.translation import gettext_lazy as _


class ModuleChoices(models.IntegerChoices):
    ELIGIBILITY_CRITERIA = 1, _('Eligibility Criteria')
    KYC_RECORD = 2, _('KYC Record')
    TAX_RECORD = 3, _('Tax Record')
    BANKING_DETAILS = 4, _('Banking Details')
    FUND_DOCUMENTS = 5, _('Fund Documents')
    REQUESTED_DOCUMENT = 6, _('Requested Documents')
    INVESTMENT_ALLOCATION = 7, _('Investment Allocation')
    PARTICIPANT = 8, _('Participant')
    AGREEMENT = 9, _('Agreement')
    POWER_OF_ATTORNEY_DOCUMENT = 10, _('Power of Attorney Document')


class Comment(BaseModel):
    class Statuses(models.IntegerChoices):
        CREATED = 1, _('Created')
        UPDATED = 2, _('Updated')
        RESOLVED = 3, _('Resolved')

    text = models.TextField(null=False)
    status = models.PositiveSmallIntegerField(choices=Statuses.choices, default=Statuses.CREATED)
    history = HistoricalRecords()
    path = models.CharField(max_length=256, null=False)
    created_by = models.ForeignKey("companies.CompanyUser",
                                   on_delete=models.DO_NOTHING,
                                   null=False,
                                   blank=False,
                                   related_name='comments')

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.DO_NOTHING,
        null=False,
        blank=False
    )
    section = models.CharField(max_length=256, null=False)

    def __str__(self):
        return self.text


class ApplicationComment(BaseModel):
    class Statuses(models.IntegerChoices):
        CREATED = 1, _('Created')
        UPDATED = 2, _('Updated')
        RESOLVED = 3, _('Resolved')

    class ModuleChoices(models.IntegerChoices):
        ELIGIBILITY_CRITERIA = 1, _('Eligibility Criteria')
        KYC_RECORD = 2, _('KYC Record')
        TAX_RECORD = 3, _('Tax Record')
        BANKING_DETAILS = 4, _('Banking Details')
        FUND_DOCUMENTS = 5, _('Fund Documents')
        REQUESTED_DOCUMENT = 6, _('Requested Documents')
        INVESTMENT_ALLOCATION = 7, _('Investment Allocation')
        PARTICIPANT = 8, _('Participant')
        AGREEMENTS = 9, _('Agreements')
        POWER_OF_ATTORNEY_DOCUMENT = 10, _('Power of Attorney Document')

    history = HistoricalRecords()
    text = models.TextField(null=False)
    status = models.PositiveSmallIntegerField(choices=Statuses.choices, default=Statuses.CREATED)
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='application_comments'
    )
    kyc_record = models.ForeignKey(
        'kyc_records.KYCRecord',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='kyc_record_comments'
    )
    commented_by = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_comments'
    )
    comment_for = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_comments'
    )

    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=False,
        blank=False
    )
    module = models.PositiveSmallIntegerField(
        choices=ModuleChoices.choices,
        null=True,
        blank=True,
        db_index=True
    )
    module_id = models.PositiveIntegerField(db_index=True)
    question_identifier = models.CharField(max_length=250, db_index=True)
    document_identifier = models.CharField(max_length=250, null=True, blank=True)
    comment_label = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.text


class ApplicationCommentReply(BaseModel):
    text = models.TextField(null=False)
    comment = models.ForeignKey(ApplicationComment, on_delete=models.CASCADE, related_name='replies')
    reply_by = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_replies'
    )

    history = HistoricalRecords()

    def __str__(self):
        return self.text
