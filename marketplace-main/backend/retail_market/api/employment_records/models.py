import encrypted_fields.fields
from django.db import models
from django.db.models import UniqueConstraint, Q
from simple_history.models import HistoricalRecords
from django.utils.translation import gettext_lazy as _
from api.models import BaseModel, MultiTenantModel
from core.managers.has_company_filter_manager import HasCompanyFilterManager


class CompanyConfigurableModel(MultiTenantModel):
    name = models.CharField(max_length=250, null=True, blank=True)

    class Meta:
        abstract = True


class Department(CompanyConfigurableModel):
    class Meta:
        db_table = "departments"
        unique_together = ('company', 'name')


class JobBand(CompanyConfigurableModel):
    class Meta:
        db_table = "job_bands"
        unique_together = ('company', 'name')


class OfficeLocation(CompanyConfigurableModel):
    class Meta:
        db_table = "office_locations"
        unique_together = ('company', 'name')


class BusinessUnit(CompanyConfigurableModel):
    class Meta:
        unique_together = ('company', 'name')


class CostCenter(CompanyConfigurableModel):
    class Meta:
        unique_together = ('company', 'name')


class EmploymentRecord(BaseModel):
    department = models.ForeignKey(Department, null=True, on_delete=models.CASCADE)
    participant_profile = models.OneToOneField('participants.ParticipantProfile', on_delete=models.CASCADE, null=True)
    job_band = models.ForeignKey(JobBand, null=True, on_delete=models.CASCADE)
    office_location = models.ForeignKey(OfficeLocation, null=True, on_delete=models.CASCADE)
    hire_date = models.DateTimeField(null=True)
    separation_date = models.DateTimeField(null=True)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
    )

    ein = models.CharField(
        max_length=24,
        null=True,
        blank=True
    )

    manager = models.ForeignKey(
        'self',
        related_name='direct_reports',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    currency = models.ForeignKey(
        'currencies.Currency',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='currency_employent_records'
    )

    objects = HasCompanyFilterManager()
    history = HistoricalRecords()
    deleted = models.BooleanField(default=False)

    def get_direct_report_employees(self):
        return EmploymentRecord.objects.filter(company=self.company, manager=self)

    class Meta:
        db_table = 'employment_records'
        constraints = [
            UniqueConstraint(
                fields=('company', 'ein'),
                condition=Q(deleted=False) &
                          Q(ein__isnull=False) &
                          ~Q(ein=None) &
                          ~Q(ein=''),
                name='unique_company_ein'
            )
        ]

    @property
    def status(self):
        try:
            return self.status_history.latest('created_at').status
        except EmploymentRecordStatusHistory.DoesNotExist:
            return None


class EmploymentRecordStatusHistory(BaseModel):
    class EmploymentRecordStatus(models.TextChoices):
        ACTIVE = 'active', _('Active')
        INACTIVE = 'inactive', _('Inactive')

    employment_record = models.ForeignKey(EmploymentRecord, on_delete=models.CASCADE, related_name="status_history")
    status = models.CharField(max_length=10, choices=EmploymentRecordStatus.choices, null=True)
    updated_by = models.ForeignKey(
        "users.RetailUser",
        on_delete=models.CASCADE
    )


class EmployeesOnboardingFile(BaseModel):
    document = models.OneToOneField("documents.Document", on_delete=models.CASCADE,
                                    related_name="employees_onboarding_file")
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey("admin_users.AdminUser", on_delete=models.CASCADE)

    class Meta:
        db_table = "employees_onboarding_files"


class CompanyRole(CompanyConfigurableModel):
    class Meta:
        db_table = "company_roles"
        unique_together = ('company', 'name')


class Position(BaseModel):
    functional_role = models.ForeignKey(
        CompanyRole,
        help_text="Role name, defined by company",
        on_delete=models.CASCADE,
        null=True
    )
    title = models.CharField(max_length=255, null=True, blank=True)
    annual_salary = encrypted_fields.fields.EncryptedCharField(default='', max_length=20, null=True, blank=True,
                                                               help_text="Expected annual salary,"
                                                                         " not the current compensation")
    target_bonus = encrypted_fields.fields.EncryptedCharField(default='', max_length=20, null=True, blank=True,
                                                              help_text="Expected bonus, not the current bonus")
    salary_currency = models.ForeignKey("currencies.Currency", on_delete=models.DO_NOTHING, null=True)
    start_date = models.DateTimeField(help_text="Date when the employee started the role", null=True)
    end_date = models.DateTimeField(help_text="Date when the employee ended the role, can be null if the employee is "
                                              "still in the position", null=True)
    employment_record = models.ForeignKey(EmploymentRecord, on_delete=models.CASCADE, related_name="positions")
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
    )
    cost_center = models.ForeignKey(
        CostCenter,
        null=True,
        on_delete=models.SET_NULL,
        related_name='center_positions'
    )
    business_unit = models.ForeignKey(
        BusinessUnit,
        null=True,
        on_delete=models.SET_NULL,
        related_name='unit_positions'
    )
    objects = HasCompanyFilterManager()
    history = HistoricalRecords()

    class Meta:
        db_table = 'positions'

    @property
    def display_title(self):
        if self.title:
            return self.title

        if self.functional_role:
            return self.functional_role.name


class CompanyFirmViewFilter(BaseModel):
    company = models.OneToOneField('companies.Company', on_delete=models.CASCADE, related_name='firm_view_filter')
    filters = models.JSONField(default=list)
