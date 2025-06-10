import logging
import os
from uuid import uuid4

from dateutil.utils import today
from django.core.validators import FileExtensionValidator
from django.db import models
from django.db.models import JSONField, ForeignObjectRel, Prefetch
from simple_history.models import HistoricalRecords
from django.utils.translation import gettext_lazy as _

from api.documents.models import Document
from api.feature_flags.constants import PORTFOLIO_PAGE_MULTIPLE_CURRENCY_FLAG
from api.feature_flags.provider import FeatureFlagProvider
from api.geographics.models import Address
from api.models import BaseModel, IMAGE_EXTENTIONS

logger = logging.getLogger()

def company_logo_upload_path(instance, filename):
    _, ext = os.path.splitext(filename)
    return 'companies/{company_id}/logo-{uuid}{ext}'.format(
        company_id=instance.id,
        uuid=uuid4().hex,
        ext=ext,
    )


def tech_partner_logo_upload_path(instance, filename):
    _, ext = os.path.splitext(filename)
    return 'companies/{company_id}/tech-partner-logo-{uuid}{ext}'.format(
        company_id=instance.id,
        uuid=uuid4().hex,
        ext=ext,
    )


class Company(BaseModel):
    class DocumentNotificationSystem(models.IntegerChoices):
        DOCUMENT_PUSH = 1, _('Document Push')
        SIDECAR = 2, _('Sidecar is the documents and records system')

    name = models.CharField(max_length=120, unique=True)
    slug = models.CharField(max_length=120, unique=True)
    is_enabled = models.BooleanField(default=True)
    is_white_labelled_company = models.BooleanField(default=False)
    show_new_commitment_flow = models.BooleanField(default=False)
    logo = models.FileField(upload_to=company_logo_upload_path,
                            null=True,
                            blank=True,
                            validators=[FileExtensionValidator(IMAGE_EXTENTIONS)])
    power_of_attorney_document = models.OneToOneField(
        'documents.Document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='power_of_attorney_for_company'
    )
    aml_kyc_expiration_in_months = models.IntegerField(null=True, blank=True, default=36)
    sso_domains = models.JSONField(default=list)
    document_system = models.PositiveSmallIntegerField(
        choices=DocumentNotificationSystem.choices,
        default=DocumentNotificationSystem.DOCUMENT_PUSH.value
    )
    address = models.ForeignKey(
        Address,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='companies'
    )
    tech_partner_logo = models.ImageField(upload_to=tech_partner_logo_upload_path, null=True, blank=True)
    base_currency = models.ForeignKey(
        'currencies.Currency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='currency_companies'
    )

    def create_application_document_notification(self):
        return self.document_system == self.DocumentNotificationSystem.SIDECAR.value

    def __str__(self):
        return self.name

    def has_vehicles(self):
        return self.fund_vehicles.count() > 0

    def is_feature_flag_active(self, feature_flag):
        provider = FeatureFlagProvider.from_params(company_ids=[self.id])
        feature_flag_status = provider.is_active(feature_flag)
        return feature_flag_status

    def allow_multiple_currencies_in_portfolio(self):
        return self.is_feature_flag_active(PORTFOLIO_PAGE_MULTIPLE_CURRENCY_FLAG)

    def backup_serialized_documents_to(self, serializer, backup_storage):

        def _prefetch_reverse_relations(queryset, model):
            prefetches = []
            for field in model._meta.get_fields():
                if isinstance(field, ForeignObjectRel) and field.auto_created:
                    related_name = field.get_accessor_name()
                    prefetches.append(Prefetch(related_name))
            return queryset.prefetch_related(*prefetches)

        all_docs = _prefetch_reverse_relations(self.company_documents.all(), Document)
        documents = [serializer(doc).data for doc in all_docs.iterator()]
        prefix = self._backup_prefix()
        application_object_key = f"{prefix}documents.csv"
        backup_storage.backup(application_object_key, documents)
        return {'prefix': prefix, 'storage_key': application_object_key}

    def backup_documents_to(self, backup_storage):
        prefix = self._backup_prefix()
        for document in self.company_documents.all():
            if len(document.get_reverse_relations()) > 0:
                document_path = document.document_path
                supporting_path = f"{prefix}{document.id}_{document.title}"
                if document_path:
                    backup_storage.backup_document(document_path, supporting_path)
                else:
                    logger.critical(f"Document does not have path {document=}")
            else:
                print(f"{self=} {self.id} Invalid document, reverse relations are empty")

    def _backup_prefix(self):
        prefix = f"company-backup-documents/{self.id}/{today().year}/"
        return prefix


class CompanyProfile(BaseModel):
    company = models.OneToOneField('Company', on_delete=models.CASCADE, related_name='company_profile')
    program_name = models.CharField(max_length=250, null=True, blank=True)
    mission_statement = models.CharField(max_length=250, null=True, blank=True)
    stats = JSONField(null=True, blank=True)
    opportunities_description = models.TextField(null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)


class CompanyFAQ(BaseModel):
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='company_faqs')
    question = models.TextField()
    answer = models.TextField()
    display_on_top = models.BooleanField(default=False)


class CompanyToken(BaseModel):
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='company_tokens')
    token = models.CharField(max_length=32, db_index=True, unique=True)


# TODO: Improve storing of ratio
class CompanyRole(BaseModel):
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='company_roles')
    name = models.CharField(max_length=120)
    leverage_percentage = models.FloatField(null=True, blank=True)
    leverage_ratio = models.CharField(max_length=5, null=True, blank=True)

    def __str__(self):
        return '{company}-{role}'.format(company=self.company, role=self.name)


class CompanyUser(BaseModel):
    history = HistoricalRecords()
    user = models.ForeignKey(
        to='users.RetailUser',
        related_name='associated_company_users',
        on_delete=models.CASCADE
    )
    company = models.ForeignKey('Company', related_name='company_users', on_delete=models.CASCADE)
    role = models.ForeignKey('CompanyRole', on_delete=models.SET_NULL, null=True, blank=True)
    partner_id = models.CharField(max_length=250, db_index=True)

    region = models.CharField(max_length=250, null=True, blank=True)
    office_location = models.ForeignKey(
        'geographics.Country',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    department = models.CharField(max_length=250, null=True, blank=True)
    job_band = models.CharField(max_length=250, null=True, blank=True)
    power_of_attorney_document = models.OneToOneField(
        'documents.Document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='power_of_attorney_for_user'
    )

    def __str__(self):
        return '{company}-{user}'.format(company=self.company, user=self.user)

    def get_full_name(self):
        return self.user.get_full_name()

    class Meta:
        unique_together = (
            ('company', 'partner_id'),
            ('company', 'user'),
        )


class CompanyFundVehicle(BaseModel):
    name = models.CharField(max_length=50)
    company = models.ForeignKey(
        'Company',
        on_delete=models.CASCADE,
        related_name='fund_vehicles'
    )


class CompanyReportDocument(BaseModel):
    class ReportTypeChoice(models.TextChoices):
        FINANCIAL_STATEMENTS = 'financial_statements', _('Financial Statements')
        FUND_ACCOUNTING = 'fund_accounting', _('Fund Accounting')
        DUE_FROM_TO_INVESTORS = 'due_from_to_investors', _('Due from/to Investors ')

    name = models.CharField(max_length=250)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='company_reports'
    )
    vehicles = models.ManyToManyField(
        CompanyFundVehicle,
        related_name='vehicle_reports'
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='document_reports'
    )
    report_date = models.DateField()
    report_type = models.CharField(
        max_length=250,
        choices=ReportTypeChoice.choices
    )


class CompanyDocument(BaseModel):
    company = models.ForeignKey(
        'Company',
        on_delete=models.CASCADE,
        related_name='company_required_documents'
    )
    document = models.ForeignKey(
        'documents.Document',
        on_delete=models.CASCADE,
        related_name='associated_company_required_documents'
    )
    deleted = models.BooleanField(default=False)
    name = models.CharField(max_length=250)
    description = models.TextField()
    required_once = models.BooleanField(default=False)
    require_signature = models.BooleanField(default=False)
    require_wet_signature = models.BooleanField(default=False)
    require_gp_signature = models.BooleanField(default=False)
    gp_signer = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='company_document_gp_signer'
    )

    class Meta:
        ordering = ("created_at",)


class CompanyTheme(BaseModel):
    company = models.OneToOneField(
        'Company',
        related_name='theme',
        on_delete=models.CASCADE
    )
    theme = models.JSONField(default=dict)
