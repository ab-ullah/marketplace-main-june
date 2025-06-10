import encrypted_fields.fields
from django.db import models
from django.db.models import UniqueConstraint, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from api.cards.models import Workflow
from api.companies.models import Company
from api.constants.field_options import EmploymentStatus
from api.constants.id_documents import IdDocuments
from api.constants.kyc_investor_types import KYCInvestorType
from api.geographics.models import Country
from api.models import BaseModel
from api.users.models import RetailUser

import uuid


class KYCStatuses(models.IntegerChoices):
    CREATED = 1, _('Created')
    SUBMITTED = 2, _('Submitted')
    CHANGE_REQUESTED = 3, _('Change Requested')
    APPROVED = 4, _('Approved')


class DEPARTMENT(models.TextChoices):
    Other = 'other', _('Other')
    GMBO = 'general-management-business-operations', _('General Management / Business Operations')
    PFM = 'portfolio-&-fund-management', _('Portfolio & Fund Management')
    TSAS = 'transactions-acquisitions', _('Transactions / Acquisitions')
    AssetManagement = 'asset-management', _('Asset Management')
    ResearchStrategy = 'research-strategy', _('Research & Strategy')
    AccountingFinance = 'accounting-&-finance', _('Investor Accounting & Finance')
    IRRM = 'investor-relations/relationship-managers', _('Investor Relations - Relationship Managers')
    IRPM = 'investor-relations/pm', _('Investor Relations - Project Management')
    PWG = 'pwg', _('PWG')
    InvestorServices = 'investor-services', _('Investor Services')
    Tax = 'tax', _('Tax')
    Legal = 'legal-&-compliance', _('Legal & compliance')
    Technology = 'technology', _('Technology')
    CorpAandF = 'corporate-accounting-&-finance', _('Corporate Accounting & Finance')
    MarketingCommunications = 'marketing-communications', _('Marketing & Communications')
    HR = 'hr', _('Human Resources')
    ESG = 'esg', _('ESG / Sustainability')
    ADMIN = 'admin', _('Administration (assistants & office managers)')


class JobBandChoices(models.TextChoices):
    B1 = "Business Support 1", _("Business Support 1")
    B2 = "Business Support 2", _("Business Support 2")
    B3 = "Business Support 3", _("Business Support 3")
    B4 = "Business Support 4", _("Business Support 4")
    B5 = "Business Support 5", _("Business Support 5")
    I1 = "Portfolio and Fund Investment 1", _("Portfolio and Fund Investment 1")
    I2 = "Portfolio and Fund Investment 2", _("Portfolio and Fund Investment 2")
    I3 = "Portfolio and Fund Investment 3", _("Portfolio and Fund Investment 3")
    I4 = "Portfolio and Fund Investment 4", _("Portfolio and Fund Investment 4")
    I5 = "Portfolio and Fund Investment 5", _("Portfolio and Fund Investment 5")
    L1 = "Leadership 1", _("Leadership 1")
    L2 = "Leadership 2", _("Leadership 2")
    L3 = "Leadership 3", _("Leadership 3")
    L4 = "Leadership 4", _("Leadership 4")
    M1 = "Management 1", _("Management 1")
    M2 = "Management 2", _("Management 2")
    M3 = "Management 3", _("Management 3")
    M4 = "Management 4", _("Management 4")
    M5 = "Management 5", _("Management 5")
    P1 = "Professional 1", _("Professional 1")
    P2 = "Professional 2", _("Professional 2")
    P3 = "Professional 3", _("Professional 3")
    P4 = "Professional 4", _("Professional 4")
    P5 = "Professional 5", _("Professional 5")
    P6 = "Professional 6", _("Professional 6")
    PR1 = "Producer 1", _("Producer 1")
    PR2 = "Producer 2", _("Producer 2")
    PR3 = "Producer 3", _("Producer 3")
    PR4 = "Producer 4", _("Producer 4")
    PR5 = "Producer 5", _("Producer 5")
    PR6 = "Producer 6", _("Producer 6")
    PR7 = "Producer 7", _("Producer 7")
    SP1 = "Specialist 1", _("Specialist 1")
    SP2 = "Specialist 2", _("Specialist 2")
    SP3 = "Specialist 3", _("Specialist 3")
    SP4 = "Specialist 4", _("Specialist 4")


class KYCRecord(BaseModel):
    history = HistoricalRecords()
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.PositiveSmallIntegerField(choices=KYCStatuses.choices, default=KYCStatuses.CREATED)
    kyc_investor_type = models.PositiveSmallIntegerField(choices=KYCInvestorType.choices,
                                                         default=KYCInvestorType.INDIVIDUAL)
    # personal
    first_name = models.CharField(max_length=120, null=True, blank=True)
    last_name = models.CharField(max_length=120, null=True, blank=True)
    employment_status = models.PositiveSmallIntegerField(choices=EmploymentStatus.choices, null=True, blank=True)
    employer_name = models.CharField(max_length=120, null=True, blank=True)
    occupation = models.CharField(max_length=120, null=True, blank=True)
    citizenship_country = models.ForeignKey(
        'geographics.Country',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="citizenship_country"
    )
    uk_national_insurance_number = encrypted_fields.fields.EncryptedCharField(default='', max_length=20, null=True,
                                                                              blank=True)
    source_of_wealth = models.CharField(max_length=500, null=True, blank=True)
    source_of_funds = encrypted_fields.fields.EncryptedCharField(default='', max_length=500, null=True, blank=True)
    date_of_birth = encrypted_fields.fields.EncryptedDateField(null=True)
    is_lasalle_or_jll_employee = models.BooleanField(null=True)
    pollitically_exposed_person = models.BooleanField(null=True)
    purpose_of_the_subscription = models.CharField(max_length=20, null=True, blank=True)
    purpose_of_the_subscription_other = models.CharField(max_length=500, null=True, blank=True)
    phone_number = encrypted_fields.fields.EncryptedCharField(max_length=20, null=True, blank=True)
    economic_beneficiary = encrypted_fields.fields.EncryptedCharField(max_length=20, null=True, blank=True)
    source_of_funds_other = encrypted_fields.fields.EncryptedCharField(max_length=500, null=True, blank=True)
    source_of_funds_sale = encrypted_fields.fields.EncryptedCharField(max_length=500, null=True, blank=True)
    source_of_funds_profession = encrypted_fields.fields.EncryptedCharField(max_length=500, null=True, blank=True)
    is_us_citizen = models.BooleanField(null=True)
    applicant_owned_by_another_entity = models.BooleanField(null=True)
    direct_parent_owned_by_another_entity = models.BooleanField(null=True)
    applicant_organized_for_specific_purpose_of_investing = models.BooleanField(null=True)
    net_worth = encrypted_fields.fields.EncryptedCharField(default='', max_length=120, null=True, blank=True)
    jurisdiction_state = models.ForeignKey(
        'geographics.USState',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="jurisdiction_state"
    )

    # home address
    home_country = models.ForeignKey(
        'geographics.Country',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="home_country"
    )
    home_address = models.CharField(max_length=120, null=True, blank=True)
    home_city = models.CharField(max_length=120, null=True, blank=True)
    home_state = models.CharField(max_length=120, null=True, blank=True)
    home_region = models.CharField(max_length=120, null=True, blank=True)
    home_zip = models.CharField(max_length=120, null=True, blank=True)
    home_phone_number = models.CharField(max_length=120, null=True)
    home_id_type = models.CharField(max_length=20, null=True)

    # eligibility
    eligibility_country = models.ForeignKey(
        'geographics.Country',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="eligibility_country"
    )

    # documents
    id_document_type = models.PositiveSmallIntegerField(choices=IdDocuments.choices, null=True)
    id_issuing_country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True,
                                           related_name="id_document_country")
    id_expiration_date = models.DateField(null=True)
    number_of_id = encrypted_fields.fields.EncryptedCharField(default='', max_length=120, null=True, blank=True)

    # entities
    entity_name = models.CharField(max_length=120, null=True, blank=True)
    entity_title = encrypted_fields.fields.EncryptedCharField(max_length=120, null=True, blank=True)
    general_partnership_is_a_private_company = models.BooleanField(null=True)

    # relationships
    user = models.ForeignKey(RetailUser, on_delete=models.CASCADE, related_name="kyc_records")
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, null=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=False)
    kyc_entity = models.ForeignKey('self', on_delete=models.CASCADE, null=True, related_name="kyc_participants")
    review_workflow = models.OneToOneField(
        'workflows.WorkFlow',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workflow_kyc_record'
    )
    tax_record = models.OneToOneField(
        'tax_records.TaxRecord',
        related_name='tax_kyc_record',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    payment_detail = models.ForeignKey(
        'payments.PaymentDetail',
        related_name="kyc_payment_details",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    deleted = models.BooleanField(default=False)

    department = models.CharField(max_length=250, null=True, blank=True)
    job_band = models.CharField(max_length=250, null=True, blank=True)
    invite_only = models.BooleanField(default=False)
    max_leverage_ratio = models.FloatField(null=True, blank=True)

    office_location = models.ForeignKey(
        'geographics.Country',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    investor_location = models.ForeignKey(
        'geographics.Country',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="investor_location"
    )
    job_title = models.CharField(max_length=250, null=True, blank=True)

    # entities

    date_of_formation = models.DateField(null=True)
    jurisdiction = models.ForeignKey(
        'geographics.Country',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="date_of_formation"
    )
    nature_of_business = models.CharField(max_length=500, null=True, blank=True)
    registered_address = models.CharField(max_length=500, null=True, blank=True)
    one_director = models.BooleanField(null=True, blank=True)

    approved = models.BooleanField(default=False)

    def is_individual_record(self):
        return self.kyc_investor_type == KYCInvestorType.INDIVIDUAL.value

    def is_participant_record(self):
        return self.kyc_investor_type == KYCInvestorType.PARTICIPANT.value

    def kyc_owner(self):
        if self.kyc_investor_type == KYCInvestorType.PARTICIPANT.value:
            if self.kyc_entity:
                return self.kyc_entity.user

        else:
            return self.user

    def get_display_name(self):
        if self.is_individual_record() or self.is_participant_record():
            return f'{self.first_name} {self.last_name}'
        return self.entity_name

    def is_auto_approved(self):
        has_evaluation = hasattr(self, 'risk_value_kyc')
        if self.id_expiration_date and self.id_expiration_date < timezone.now().date():
            return False

        if not has_evaluation:
            return False
        return self.approved and self.risk_value_kyc.risk_value == KYCRiskEvaluation.RiskValueChoices.LOW.value

    def get_serialized_data(self):
        from api.kyc_records.views import _get_serializer_by_workflow_slug
        serializer = _get_serializer_by_workflow_slug(self.workflow.slug)
        return serializer(self).data

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['company', 'user', 'workflow', 'kyc_investor_type'],
                condition=Q(deleted=False) & ~Q(kyc_investor_type=KYCInvestorType.PARTICIPANT.value),
                name='unique_kyc_validation'
            )
        ]


class KYCRiskEvaluation(BaseModel):
    class RiskValueChoices(models.IntegerChoices):
        LOW = 1, _('Low')
        MEDIUM = 2, _('Medium')
        HIGH = 3, _('High')

    risk_value = models.PositiveSmallIntegerField(null=True, blank=True)
    kyc_record = models.OneToOneField(
        'KYCRecord',
        on_delete=models.CASCADE,
        related_name='risk_value_kyc'
    )
    reviewer = models.ForeignKey(
        'admin_users.AdminUser',
        on_delete=models.CASCADE
    )

    def get_risk_value_display(self):
        choices = dict(KYCRiskEvaluation.RiskValueChoices.choices)
        return choices.get(self.risk_value, '')
