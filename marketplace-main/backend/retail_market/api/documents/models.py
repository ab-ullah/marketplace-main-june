import logging
import uuid

from django.db import models
from django.db.models import OneToOneField, OneToOneRel, ForeignObjectRel
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from api.documents.exceptions import MissingUploadedByUserException
from api.documents.managers import NonReplacedDocumentsManager
from api.models import BaseModel
from simple_history.models import HistoricalRecords

from core.managers.non_deleted_manager import NonDeletedManager

logger = logging.getLogger()

class Document(BaseModel):
    class DocumentType(models.IntegerChoices):
        CAPITAL_CALL = 1, _('Capital Call')
        PROSPECTUS = 2, _('Prospectus')
        AGREEMENT = 3, _('Agreement')
        INTEREST_STATEMENT = 4, _('Interest Statement')
        NAV_STATEMENT = 5, _('Nav Statement')
        PITCH_BOOK = 6, _('Pitch Book')
        TAX = 7, _('Tax')
        OTHER = 8, _('Other')
        DISTRIBUTIONS = 9, _('Distribution Notice')
        INVESTOR_REPORTS = 10, _('Investor Reports')
        FINANCIAL_STATEMENTS = 11, _('Financial Statements')
        PURCHASE_AGREEMENTS = 12, _('Purchase Agreements')
        SUBSCRIPTION_DOCUMENTS = 13, _('Subscription Documents')
        ELIGIBILITY_CRITERIA_DOCUMENT = 14, _('Eligibility Criteria Documents')
        FUND_MARKETING_PAGE_DOCUMENT = 15, _('Fund Marketing Page Documents')
        KYC_DOCUMENT = 16, _('KYC/AML Documents')
        TAX_DOCUMENT = 17, _('Tax Documents')
        FUND_INVITE_DOCUMENT = 18, _('Fund Invite Document')
        FUND_AGREEMENT_DOCUMENT = 19, _('Fund Agreement Document')
        FUND_DATA_PROTECTION_POLICY = 20, _('Fund Data Protection Policy')
        POWER_OF_ATTORNEY_DOCUMENT = 21, _('Power Of Attorney Document')
        FINANCIAL_INFORMATION = 22, _("Financial Information")
        PROPERTY_PORTFOLIO = 23, _("Property Portfolio")
        QUARTERLY_REPORT = 24, _("Quarterly Report")
        ETHICS = 25, _("Ethics")
        INVESTOR_MEETING_MATERIALS = 26, _("Investor Meeting Materials")
        STRATEGIC_MATERIALS = 27, _("Strategic Materials")
        SUSTAINABILITY = 28, _("Sustainability")
        COMPANY_DOCUMENT = 29, _('Company Document')
        ANNUAL_REPORT = 30, _('Annual Report')
        MONTHLY_REPORT = 31, _('Monthly Report')
        SUPPORTING_DOCUMENT = 32, _('Supporting Document')
        PUBLIC_DOCUMENT = 33, _('Public Document')
        BULK_CAPITAL_CALL = 34, _('Bulk Capital Call')
        REPORT = 35, _('Report')
        BULK_DISTRIBUTION = 36, _('Bulk Distribution Notice')
        NOTICE_CONSIDERATIONS = 37, _('Notice Considerations')
        BULK_UPDATE_INVESTOR_ACCOUNT_CODE = 38, _('Investor Account Codes Bulk Update')
        COMPENSATION_FILE = 39, _('Compensation File')
        ORG_HIERARCHY_FILE = 40, _('Org Hierarchy File')

    class AccessScopeOptions(models.IntegerChoices):
        COMPANY = 1, _('Company')
        USER_ONLY = 2, _('User Only')
        INVESTOR_ONLY = 3, _('Investor Only')

    history = HistoricalRecords()
    partner_id = models.CharField(max_length=250, db_index=True)
    document_id = models.UUIDField()
    content_type = models.CharField(max_length=120)
    title = models.CharField(max_length=250)
    extension = models.CharField(max_length=10)
    document_type = models.PositiveSmallIntegerField(
        choices=DocumentType.choices,
        default=DocumentType.PROSPECTUS.value
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='company_documents'
    )

    # documents can be moved between hosts, lets store the path here, then we can compute the full URL using the
    # application config.
    document_path = models.CharField(max_length=255)

    # If this was uploaded by a person then this will be set, if this is null
    # then a system processed the upload.
    uploaded_by = models.ForeignKey("companies.CompanyUser",
                                    on_delete=models.SET_NULL,
                                    null=True,
                                    blank=True,
                                    related_name='created_by')

    uploaded_by_user = models.ForeignKey(
        "companies.CompanyUser",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_uploaded_documents'
    )

    uploaded_by_admin = models.ForeignKey(
        "admin_users.AdminUser",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admin_uploaded_documents'
    )

    file_date = models.DateField(null=True, blank=True)
    access_scope = models.PositiveSmallIntegerField(
        choices=AccessScopeOptions.choices,
        default=AccessScopeOptions.USER_ONLY.value
    )
    deleted = models.BooleanField(default=False)
    _obj_relations = []

    class Meta:
        unique_together = (('company_id', 'partner_id'),)

    def file_name(self):
        return "{}.{}".format(self.title, self.extension)

    @classmethod
    def create_pdf_document(cls, **kwargs):
        document_data = {
            **kwargs,
            'extension': 'pdf',
            'content_type': 'application/pdf',
        }
        if 'partner_id' not in document_data:
            document_data['partner_id'] = uuid.uuid4().hex

        if 'document_id' not in document_data:
            document_data['document_id'] = uuid.uuid4().hex

        if 'file_date' not in document_data:
            document_data['file_date'] = timezone.now().date()

        return cls.objects.create(
            **document_data
        )

    def save(self, *args, **kwargs):
        if self.access_scope == Document.AccessScopeOptions.USER_ONLY and not self.uploaded_by_user:
            raise MissingUploadedByUserException('Missing uploaded_by_user in the document')

        super().save(*args, **kwargs)

    def get_display_name_for_email(self):
        d = {
            Document.DocumentType.CAPITAL_CALL.value: _('Capital Call Notice'),
            Document.DocumentType.PROSPECTUS.value: _('Prospectus'),
            Document.DocumentType.AGREEMENT.value: _('Agreement Document'),
            Document.DocumentType.INTEREST_STATEMENT.value: _('Interest Statement'),
            Document.DocumentType.NAV_STATEMENT.value: _('NAV Statement'),
            Document.DocumentType.PITCH_BOOK.value: _('Pitch Book'),
            Document.DocumentType.TAX.value: _('Tax Document'),
            Document.DocumentType.OTHER.value: _('Document'),
            Document.DocumentType.DISTRIBUTIONS.value: _('Distribution Notice'),
            Document.DocumentType.INVESTOR_REPORTS.value: _('Investor Report'),
            Document.DocumentType.FINANCIAL_STATEMENTS.value: _('Financial Statement'),
            Document.DocumentType.PURCHASE_AGREEMENTS.value: _('Purchase Agreement'),
            Document.DocumentType.SUBSCRIPTION_DOCUMENTS.value: _('Subscription Document'),
            Document.DocumentType.ELIGIBILITY_CRITERIA_DOCUMENT.value: _('Eligibility Criteria Document'),
            Document.DocumentType.FUND_MARKETING_PAGE_DOCUMENT.value: _('Fund Marketing Page Document'),
            Document.DocumentType.KYC_DOCUMENT.value: _('KYC/AML Document'),
            Document.DocumentType.TAX_DOCUMENT.value: _('Tax Document'),
            Document.DocumentType.FUND_INVITE_DOCUMENT.value: _('Fund Invite Document'),
            Document.DocumentType.FUND_AGREEMENT_DOCUMENT.value: _('Fund Agreement Document'),
            Document.DocumentType.FUND_DATA_PROTECTION_POLICY.value: _('Fund Data Protection Policy'),
            Document.DocumentType.POWER_OF_ATTORNEY_DOCUMENT.value: _('Power of Attorney Document'),
            Document.DocumentType.FINANCIAL_INFORMATION.value: _("Financial Information Document"),
            Document.DocumentType.PROPERTY_PORTFOLIO.value: _("Property Portfolio Document"),
            Document.DocumentType.QUARTERLY_REPORT.value: _("Quarterly Report"),
            Document.DocumentType.ETHICS.value: _("Ethics Document"),
            Document.DocumentType.INVESTOR_MEETING_MATERIALS.value: _("Investor Meeting Materials Document"),
            Document.DocumentType.STRATEGIC_MATERIALS.value: _("Strategic Materials Document"),
            Document.DocumentType.SUSTAINABILITY.value: _("Sustainability Document"),
            Document.DocumentType.COMPANY_DOCUMENT.value: _('Company Document'),
            Document.DocumentType.ANNUAL_REPORT.value: _('Annual Report'),
            Document.DocumentType.MONTHLY_REPORT.value: _('Monthly Report'),
            Document.DocumentType.SUPPORTING_DOCUMENT.value: _('Supporting Document'),
            Document.DocumentType.PUBLIC_DOCUMENT.value: _('Public Document'),
            Document.DocumentType.BULK_CAPITAL_CALL.value: _('Bulk Capital Call Notice'),
            Document.DocumentType.REPORT.value: _('Report'),
        }
        return d.get(self.document_type, self.get_document_type_display())

    def get_reverse_relations(self):
        if self._obj_relations:
            return self._obj_relations
        verified_relations = []
        for field in self._meta.get_fields():
            if field.auto_created and not field.concrete:
                accessor_name = field.get_accessor_name()
                try:
                    related_instance = getattr(self, accessor_name, None)
                    if related_instance and isinstance(field, OneToOneRel):
                        verified_relations.append(related_instance)
                    elif related_instance and isinstance(field, ForeignObjectRel):
                        verified_relations.extend([rel for rel in related_instance.all()])
                except Exception as e:
                    logger.warning(f"Case not handled for related instance: {e=} {e.args=}")
        self._obj_relations = verified_relations
        return verified_relations

    def __str__(self):
        return f"<Document {self.id} {self.get_document_type_display()}>"


class InvestorDocument(BaseModel):
    investor = models.ForeignKey("investors.Investor", on_delete=models.SET_NULL, related_name="investor_documents",
                                 null=True)
    document = models.ForeignKey("Document", on_delete=models.CASCADE, related_name="document_investors")
    fund = models.ForeignKey(
        'funds.Fund',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='fund_investor_documents'
    )
    deleted = models.BooleanField(default=False)

    def get_full_name(self):
        return self.investor.name

    def get_fund_name(self):
        if self.fund:
            return self.fund.name
        return ""


class FundDocument(BaseModel):
    history = HistoricalRecords()

    fund = models.ForeignKey("funds.Fund", on_delete=models.SET_NULL, related_name="fund_documents", null=True)
    replaced_by = models.OneToOneField(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    is_replaced = models.BooleanField(default=False)
    document = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name="document_fund")
    position = models.IntegerField(null=True, blank=True)
    document_for = models.ManyToManyField('funds.FundShareClass', blank=True)
    require_signature = models.BooleanField(default=False)
    require_gp_signature = models.BooleanField(default=False)
    gp_signer = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='gp_signer'
    )
    require_acknowledgement = models.BooleanField(default=True)
    deleted = models.BooleanField(default=False)

    objects = NonReplacedDocumentsManager()
    non_deleted = NonDeletedManager()
    include_deleted = models.Manager()

    def get_fund_name(self):
        return self.fund.name


class FundInviteDocument(BaseModel):
    fund = models.ForeignKey("funds.Fund", on_delete=models.SET_NULL, related_name="invitation_document", null=True)
    document = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name="invited_in_funds")

    def get_fund_name(self):
        return self.fund.name


class KYCDocument(BaseModel):
    history = HistoricalRecords()
    kyc_record = models.ForeignKey("kyc_records.KYCRecord", on_delete=models.CASCADE, related_name="kyc_documents")
    document = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name="document")
    kyc_record_file_id = models.CharField(max_length=255, null=False)
    deleted = models.BooleanField(default=False)
    partner_id = models.CharField(max_length=250, db_index=True, unique=True)

    def get_full_name(self):
        return self.kyc_record.get_display_name()


class TaxDocument(BaseModel):
    history = HistoricalRecords()
    tax_record = models.ForeignKey("tax_records.TaxRecord", on_delete=models.CASCADE, related_name="tax_documents")
    envelope_id = models.CharField(max_length=80, unique=True, default=None, null=True)
    document = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name='tax_document')
    certificate = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name='signature_certificate',
                                       null=True)
    form = models.ForeignKey("tax_records.TaxForm", on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    owner = models.ForeignKey("users.RetailUser", on_delete=models.CASCADE, related_name="tax_documents")
    deleted = models.BooleanField(default=False)
    partner_id = models.CharField(max_length=250, db_index=True, unique=True)
    approved = models.BooleanField(default=False)

    def get_full_name(self):
        if self.tax_record.applications.count() > 1:
            latest_application = self.tax_record.applications.latest('created_at')
            return f"{latest_application.applicant_first_name()} {latest_application.applicant_last_name()}"
        return self.owner.get_full_name()


class CriteriaBlockDocument(BaseModel):
    document = models.ForeignKey("Document", on_delete=models.CASCADE, related_name="document_criteria_blocks")
    criteria_block = models.ForeignKey(
        "eligibility_criteria.CriteriaBlock",
        on_delete=models.CASCADE,
        related_name="criteria_block_documents")

    def get_fund_name(self):
        return self.criteria_block.criteria.fund.name


class ApplicationRequestDocument(BaseModel):
    application_document_request = models.ForeignKey("applications.ApplicationDocumentsRequests",
                                                     on_delete=models.CASCADE,
                                                     related_name="application_request_document",
                                                     null=True)
    document = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name="requested_document")

    def get_full_name(self):
        return f"{self.application_document_request.application.applicant_first_name()} {self.application_document_request.application.applicant_last_name()}"

    def get_fund_name(self):
        return self.application_document_request.application.fund.name


class CompanyDataProtectionPolicyDocument(BaseModel):
    company = models.ForeignKey("companies.Company",
                                on_delete=models.CASCADE,
                                related_name="company_data_protection_policy_document",
                                null=True)
    document = models.ForeignKey(to="Document", on_delete=models.CASCADE,
                                 related_name="data_protection_policy_document")


class ApplicationSupportingDocument(BaseModel):
    document_name = models.TextField(null=False)
    document_description = models.TextField(null=False)
    application = models.ForeignKey("applications.Application",
                                    on_delete=models.CASCADE,
                                    null=False,
                                    related_name="application_supporting_documents")
    document = models.ForeignKey(to="Document", on_delete=models.CASCADE, related_name="supporting_document")
    deleted = models.BooleanField(default=False)
    history = HistoricalRecords()
    last_updated_by = models.ForeignKey(
        "admin_users.AdminUser",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admin_supporting_documents'
    )

    def get_fund_name(self):
        return self.application.fund.name

    def get_full_name(self):
        return self.application.kyc_record.get_display_name()


class PublicFundDocument(BaseModel):
    fund = models.ForeignKey("funds.Fund", on_delete=models.SET_NULL, related_name="public_fund_documents", null=True)
    document = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name="public_document")

    def get_fund_name(self):
        return self.fund.name


class UserNoticeDocument(BaseModel):
    document = models.OneToOneField(to="Document", on_delete=models.CASCADE, related_name="notice_document")
    investor = models.ForeignKey(
        'investors.Investor',
        on_delete=models.CASCADE,
        related_name='investor_notice_documents'
    )

    def get_full_name(self):
        return self.investor.name


class InvestorAccountCodeBulkUpdateDocument(BaseModel):
    document = models.OneToOneField("Document", on_delete=models.CASCADE, related_name="investor_account_code_bulk_update_document")
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, null=True)

    def get_fund_name(self):
        return self.fund.name
