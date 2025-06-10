import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _
from encrypted_fields import fields
from simple_history.models import HistoricalRecords

from api.companies.models import Company
from api.models import BaseModel
from api.users.models import RetailUser


class TaxRecordStatus(models.IntegerChoices):
    CREATED = 1, _('Created')
    SUBMITTED = 2, _('Submitted')
    CHANGE_REQUESTED = 3, _('Change Requested')
    APPROVED = 4, _('Approved')


class TaxFormType(models.IntegerChoices):
    GOVERMENT = 1, _('Goverment')
    SELF_CERTIFICATION = 2, _('Self Certification')


class TaxRecord(BaseModel):
    history = HistoricalRecords()
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.PositiveSmallIntegerField(choices=TaxRecordStatus.choices, default=TaxRecordStatus.CREATED)
    # relationships
    user = models.ForeignKey(RetailUser, on_delete=models.CASCADE, related_name="tax_records")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=False)
    deleted = models.BooleanField(default=False)
    # additional tax fields
    us_holder = models.CharField(max_length=20, null=True, blank=True)
    is_tax_exempt = models.CharField(max_length=20, null=True, blank=True)
    is_entity = models.CharField(max_length=20, null=True, blank=True)
    is_tax_exempt_in_country = models.CharField(max_length=20, null=True, blank=True)
    tin_or_ssn = fields.EncryptedCharField(max_length=50, null=True, blank=True)
    tax_year_end = fields.EncryptedDateField(null=True)
    countries = models.ManyToManyField('geographics.Country', blank=True)

    @property
    def is_approved(self):
        documents_exists = self.tax_documents.filter(deleted=False).exists()
        un_approved_exists = self.tax_documents.filter(deleted=False, approved=False).exists()
        return documents_exists and not un_approved_exists

    @property
    def get_tax_year_end_month_day(self):
        if not self.tax_year_end:
            return None

        return f'{self.tax_year_end.month}/{self.tax_year_end.day}'

    def ready_for_review(self):
        tax_documents_count = self.tax_documents.filter(deleted=False).count()
        if not tax_documents_count:
            return False
        completed_documents_count = self.tax_documents.filter(
            completed=True,
            deleted=False
        ).count()
        return tax_documents_count == completed_documents_count


class TaxForm(BaseModel):
    form_id = models.CharField(max_length=30, null=False, blank=False)
    version = models.CharField(max_length=30, null=False, blank=False)
    file_name = models.CharField(max_length=60, null=False, blank=False)
    help_link = models.URLField(null=True, blank=True)
    type = models.PositiveSmallIntegerField(choices=TaxFormType.choices, default=TaxFormType.GOVERMENT)
    description = models.TextField(null=False)
    details = models.TextField(null=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=False)

    class Meta:
        unique_together = (
            ('company', 'form_id', 'version')
        )
