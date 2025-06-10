import logging

from dateutil.utils import today
from django.db import models
from django.db.models import Manager, Q, UniqueConstraint

from api.agreements.selectors.application_agreements import all_agreements_gp_signed
from api.applications.managers import ApplicantCompanyDocumentManager
from api.applications.managers import ActiveApplications

from api.backup.models import ApplicationBackup
from api.kyc_records.models import KYCRecord
from api.models import BaseModel
from simple_history.models import HistoricalRecords

from api.payments.models import PaymentDetail
from api.tax_records.services.tax_review import TaxReviewService
from api.users.models import RetailUser
from api.companies.models import Company, CompanyUser
from api.funds.models import Fund
from api.tax_records.models import TaxRecord
from django.utils.translation import gettext_lazy as _
import uuid

from api.workflows.models import WorkFlow

logger = logging.getLogger()

class Application(BaseModel):
    class Status(models.IntegerChoices):
        CREATED = 1, _('Created')
        SUBMITTED = 2, _('Submitted')
        DENIED = 3, _('Denied')
        APPROVED = 4, _('Approved')
        WITHDRAWN = 5, _('Withdrawn')
        FINALIZED = 6, _('Finalized')

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    history = HistoricalRecords()
    user = models.ForeignKey(RetailUser, on_delete=models.CASCADE, related_name="applications", null=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=False, related_name="applications")
    fund = models.ForeignKey(Fund, on_delete=models.CASCADE, null=False, related_name="applications")
    tax_record = models.ForeignKey(TaxRecord, on_delete=models.SET_NULL, null=True, related_name="applications",
                                   help_text="Tax Record")
    kyc_record = models.ForeignKey(KYCRecord, on_delete=models.SET_NULL, null=True, related_name="applications",
                                   help_text="KyC Record")
    eligibility_response = models.ForeignKey(
        'eligibility_criteria.EligibilityCriteriaResponse',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications'
    )
    investment_amount = models.ForeignKey(
        'eligibility_criteria.InvestmentAmount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications'
    )
    status = models.PositiveSmallIntegerField(choices=Status.choices, default=Status.CREATED)
    max_leverage_ratio = models.FloatField(null=True, blank=True)
    payment_detail = models.ForeignKey(PaymentDetail, on_delete=models.SET_NULL, null=True,
                                       related_name="payment_details")
    eligibility_response_data_migration = models.BooleanField(default=False)
    workflow = models.OneToOneField(
        'workflows.WorkFlow',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='application'
    )

    share_class = models.ForeignKey(
        'funds.FundShareClass',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    vehicle = models.ForeignKey(
        'companies.CompanyFundVehicle',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    investor = models.ForeignKey(
        'investors.Investor',
        on_delete=models.SET_NULL,
        related_name='investor_applications',
        null=True,
        blank=True
    )
    is_application_updated = models.BooleanField(default=False, blank=True, null=True)

    has_custom_equity = models.BooleanField(default=False)
    has_custom_leverage = models.BooleanField(default=False)
    has_custom_total_investment = models.BooleanField(default=False)

    update_comment = models.CharField(max_length=500, blank=True, null=True)
    withdrawn_comment = models.TextField(blank=True, null=True)

    is_data_protection_policy_agreed = models.BooleanField(default=False)

    defaults_from_fund_file = models.JSONField(default=dict)
    allocation_approval_email_sent = models.BooleanField(default=False)
    restricted_time_period = models.CharField(max_length=250, null=True, blank=True)
    restricted_geographic_area = models.CharField(max_length=250, null=True, blank=True)
    region = models.CharField(max_length=250, null=True, blank=True)
    has_submitted_banking_details = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)
    is_transferred = models.BooleanField(default=False)
    transfer = models.OneToOneField(
        'transfers.Transfer',
        on_delete=models.SET_NULL,
        related_name='transfer_application',
        null=True,
        blank=True
    )
    state = models.OneToOneField(
        'applications.UserApplicationState',
        on_delete=models.SET_NULL,
        related_name='state_application',
        null=True,
        blank=True
    )
    aml_kyc_tax_email_sent = models.BooleanField(default=False)
    aml_kyc_pre_document_email_sent = models.BooleanField(default=False)
    status_updated_by = models.ForeignKey(
        'users.RetailUser',
        on_delete=models.SET_NULL,
        related_name='updated_applications',
        null=True,
        blank=True
    )

    gp_signing_completed_at = models.DateTimeField(null=True)
    disable_cashless_commitment = models.BooleanField(null=True)

    objects = Manager()
    active_applications = ActiveApplications()

    class Meta:
        constraints = [
            UniqueConstraint(fields=['user', 'fund'], condition=Q(deleted=False, is_transferred=False),
                             name='unique_user_fund_validation')
        ]
        ordering = ('-created_at',)

    @property
    def is_allocation_approved(self):
        if not self.eligibility_response:
            return False
        return self.eligibility_response.is_approved and self.status == Application.Status.APPROVED.value

    def is_cashless_commitment_enabled(self):
        return self.fund.cashless_commitment_enabled and not self.disable_cashless_commitment

    def get_company_user(self):
        return CompanyUser.objects.get(company=self.company, user=self.user)

    def is_gp_signed(self):
        return all_agreements_gp_signed(application=self)

    def start_tax_review(self):
        if not self.status == Application.Status.APPROVED.value:
            return
        tax_record = self.tax_record
        if tax_record.is_approved or not tax_record.ready_for_review():
            return
        TaxReviewService(
            tax_record=tax_record,
            fund=self.fund,
            user=self.user
        ).start_review()

    def has_pre_document_approved(self):
        if not self.workflow:
            return False

        return self.workflow.child_workflows.filter(
            module=WorkFlow.WorkFlowModuleChoices.PRE_DOCUMENT_SIGNING.value,
            is_completed=True
        ).exists()

    def start_pre_document_signing_review(self):
        from api.applications.services.pre_document_signing_review_service import PreDocumentSigningReviewService
        PreDocumentSigningReviewService(
            application=self,
        ).start_review()

    class Output:
        def __init__(self, backup_id, backup_key, message, prefix):
            self.backup_id: int = backup_id
            self.backup_key: str = backup_key
            self.message: str = message
            self.prefix: str = prefix

    def backup_to(self, serializer, backup_storage):
        dump = serializer(self).data
        prefix = self._backup_prefix()
        object_key = f"{prefix}application_{self.id}.json"
        backup_storage.backup_application(object_key, dump)
        backup = ApplicationBackup.objects.create(application=self, storage_key=object_key)
        self.backup_documents(backup_storage, prefix)
        return self.Output(prefix=prefix, backup_id=backup.id, backup_key=object_key, message='Successful')

    def _backup_prefix(self):
        prefix = f"investor-onboarding/{self.company.id}/{today().year}/{self.fund.external_id}/"
        return prefix

    def backup_documents(self, backup_storage, prefix):
        for application_supporting_document in self.application_supporting_documents.all():
            document_path = application_supporting_document.document.document_path
            supporting_path = f"{prefix}{self.generate_file_name('supporting', application_supporting_document.document)}"
            if document_path:
                backup_storage.backup_document(document_path, supporting_path)
            else:
                logger.critical(f"application supporting document has no document path: {application_supporting_document=} {application_supporting_document.id=} {self.id=} {self.user.email=} {self.fund.id}")
        for application_company_document in self.application_company_documents.all():
            if application_company_document.signed_document:
                signed_document_path = application_company_document.signed_document.document_path
                signed_new_path = f"{prefix}{self.generate_file_name('signed_document', application_company_document.signed_document)}"
                if signed_document_path:
                    backup_storage.backup_document(signed_document_path, signed_new_path)
                else:
                    logger.critical(f"signed application company signed document has no document path: {application_company_document.signed_document=} {signed_document_path.id=} {self.id=} {self.user.email=} {self.fund.id}")
            if application_company_document.certificate:
                certificate_document_path = application_company_document.certificate.document_path
                certificate_new_path = f"{prefix}{self.generate_file_name('certificate', application_company_document.certificate)}"
                if certificate_document_path:
                    backup_storage.backup_document(certificate_document_path, certificate_new_path)
                else:
                    logger.critical(f"application company certificate has no document path {application_company_document.certificate=} {application_company_document.certificate.id=} {self.id=} {self.user.email=} {self.fund.id}")
        if self.kyc_record:
            for kyc_document in self.kyc_record.kyc_documents.all():
                document_path = kyc_document.document.document_path
                kyc_path = f"{prefix}{self.generate_file_name('kyc', kyc_document.document)}"
                if document_path:
                    backup_storage.backup_document(document_path, kyc_path)
                else:
                    logger.critical(f"kyc document has no document path {kyc_document=} {kyc_document.id=} {self.id=} {self.user.email=} {self.fund.id}")
        if self.tax_record:
            for tax_document in self.tax_record.tax_documents.all():
                document_path = tax_document.document.document_path
                tax_path = f"{prefix}{self.generate_file_name('tax', tax_document.document)}"
                if document_path:
                    backup_storage.backup_document(document_path, tax_path)
                else:
                    logger.critical(f"tax document has no document path {tax_document=} {tax_document.id=} {self.id=} {self.user.email=} {self.fund.id}")
        if self.user.associated_company_users:
            company_users = self.user.associated_company_users.all()
            for company_user in company_users:
                signed_power_of_attorney = company_user.power_of_attorney_document
                if signed_power_of_attorney:
                    poa_new_path = f"{prefix}{self.generate_file_name('power_of_attorney', signed_power_of_attorney)}"
                    doc_path = signed_power_of_attorney.document_path
                    if doc_path:
                        backup_storage.backup_document(signed_power_of_attorney.document_path, poa_new_path)
                    else:
                        logger.critical(f"signed power of attorney has no document path {signed_power_of_attorney=} {signed_power_of_attorney.id=} {self.id=} {self.user.email=} {self.fund.id}")
        if self.application_agreements:
            for agreement in self.application_agreements.all():
                if agreement.signed_document:
                    signed_document_path = agreement.signed_document.document_path
                    signed_new_path = f"{prefix}{self.generate_file_name('signed_agreement', agreement.signed_document)}"
                    if signed_document_path:
                        backup_storage.backup_document(signed_document_path, signed_new_path)
                    else:
                        logger.critical(f"signed agreement has no document path {agreement.signed_document=} {agreement.id=} {self.id=} {self.user.email=} {self.fund.id}")
                if agreement.certificate:
                    certificate_document_path = agreement.certificate.document_path
                    certificate_new_path = f"{prefix}{self.generate_file_name('agreement_certificate', agreement.certificate)}"
                    if certificate_document_path:
                        backup_storage.backup_document(certificate_document_path, certificate_new_path)
                    else:
                        logger.critical(f"agreement certificate has no document path {agreement.certificate=} {agreement.id=} {self.id=} {self.user.email=} {self.fund.id}")

    def generate_file_name(self, file_type, document):
        file_name = document.file_name()
        path = f"{self.applicant_full_name()}_{file_type}_{file_name}"
        return path

    def applicant_first_name(self):
        if self.kyc_record:
            return self.kyc_record.first_name
        if self.defaults_from_fund_file and self.defaults_from_fund_file.get('first_name'):
            return self.defaults_from_fund_file['first_name']
        return self.user.first_name

    def applicant_last_name(self):
        if self.kyc_record:
            return self.kyc_record.last_name
        if self.defaults_from_fund_file and self.defaults_from_fund_file.get('last_name'):
            return self.defaults_from_fund_file['last_name']

        return self.user.last_name

    def applicant_full_name(self):
        return f"{self.applicant_first_name()}_{self.applicant_last_name()}"

    def compile_kyc_documents(self, serializer):
        res = []
        if self.kyc_record:
            res = [serializer(kyc_document.document).data for kyc_document in self.kyc_record.kyc_documents.all()]
        return res

    def compile_supporting_documents(self, serializer):
        res = [serializer(application_supporting_document.document).data for application_supporting_document in
               self.application_supporting_documents.all()]
        return res

    def compile_signed_company_documents(self, serializer):
        res = [serializer(application_company_document.signed_document).data for application_company_document in
               self.application_company_documents.all() | 
               ApplicationCompanyDocument.objects.filter(
                   application__company=self.company,
                   company_document__required_once=True, 
                   application__user=self.user,
                   completed=True)]
        return res


    def compile_certificate_company_documents(self, serializer):
        res = [serializer(application_company_document.certificate).data for application_company_document in
               self.application_company_documents.all()]
        return res

    def compile_agreements(self, serializer):
        res = []
        if self.application_agreements.all():
            res = [serializer(agreement.signed_document).data for agreement in self.application_agreements.all() if
                   agreement.signed_document is not None]
        return res

    def compile_tax_documents(self, serializer):
        res = []
        if self.tax_record:
            res = [serializer(tax_document.document).data for tax_document in self.tax_record.tax_documents.all()]
        return res

    def power_of_attorney_documents(self, serializer):
        return [serializer(company_user.power_of_attorney_document).data for company_user in
                self.user.associated_company_users.all() if company_user.power_of_attorney_document is not None]

    def acceptance_date(self):
        last_approved_document = self.application_agreements.filter(completed=True).order_by(
            '-modified_at').first()
        acceptance_date = None
        if last_approved_document:
            acceptance_date = last_approved_document.modified_at
        if not acceptance_date:
            acceptance_date = self.modified_at
        return acceptance_date


class ApplicationDocumentsRequests(BaseModel):
    class Status(models.IntegerChoices):
        CREATED = 1, _('Created')
        Pending = 2, _('Pending')
        Submitted = 3, _('Submitted')
        APPROVED = 4, _('Approved')

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    history = HistoricalRecords()
    status = models.PositiveSmallIntegerField(choices=Status.choices, default=Status.CREATED)
    document_name = models.TextField(null=False)
    document_description = models.TextField(null=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, null=False, related_name="applications")

    def get_fund_name(self):
        return self.application.fund.name


class UserApplicationState(BaseModel):
    from api.constants.module_choices import ModuleChoices
    fund = models.ForeignKey('funds.Fund', on_delete=models.CASCADE, related_name='fund_applications_states')
    user = models.ForeignKey('users.RetailUser', on_delete=models.CASCADE, related_name='user_applications_states')
    module = models.PositiveSmallIntegerField(choices=ModuleChoices.choices)
    last_position = models.CharField(max_length=50)
    deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ('-created_at',)


class ApplicationCompanyDocument(BaseModel):
    application = models.ForeignKey(
        'Application',
        on_delete=models.CASCADE,
        related_name='application_company_documents'
    )
    company_document = models.ForeignKey(
        'companies.CompanyDocument',
        on_delete=models.CASCADE,
        related_name='company_document_applications'
    )
    signed_document = models.ForeignKey(
        'documents.Document',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='document_application_company_documents'
    )
    is_acknowledged = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    gp_signing_complete = models.BooleanField(default=False)
    envelope_id = models.CharField(max_length=80, null=True, blank=True)
    objects = ApplicantCompanyDocumentManager()
    certificate = models.OneToOneField(
        'documents.Document',
        on_delete=models.SET_NULL,
        related_name='company_document_certificates',
        null=True,
        blank=True
    )
    task = models.OneToOneField(
        'workflows.Task',
        related_name='applicant_company_document',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    deleted = models.BooleanField(default=False)

    class Meta:
        ordering = ("created_at",)

    def is_fully_completed(self):
        if self.company_document.require_gp_signature:
            return self.gp_signing_complete

        if self.company_document.require_signature:
            return self.completed

        return self.is_acknowledged

    def get_signed_document(self):
        if self.company_document.require_signature:
            return self.signed_document

        return self.company_document.document
