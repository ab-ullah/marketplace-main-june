import csv
import uuid
from datetime import date
from io import StringIO

import django.db
from _decimal import Decimal
from typing import Optional

from django.db.transaction import atomic
from django.utils import timezone
from pydantic import BaseModel, EmailStr, Field, ValidationError, ConfigDict

from api.companies.models import CompanyUser, Company
from api.currencies.models import Currency
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.employment_records.models import EmployeesOnboardingFile, CompanyRole, EmploymentRecord, Position, JobBand, \
    Department, OfficeLocation
from api.participants.models import ParticipantProfile

from api.partners.constants import CurrencyEnum
from api.users.models import RetailUser


class ProcessOutput:
    def __init__(self, errors, successes):
        self.successes = successes
        self.errors = errors

    def successful(self):
        return len(self.errors) == 0

    def successes_count(self):
        return len(self.successes)


class EmployeeOnboardRow(BaseModel):
    model_config = ConfigDict(
        use_enum_values=True, validate_default=True
    )
    email: EmailStr = Field(title="Email", alias="Email")
    first_name: str = Field(title="First name", alias="First name")
    last_name: str = Field(title="Last name", alias="Last name")
    job_title: str = Field(title="Job title", alias="Job title")
    office_location: Optional[str] = Field(title="Office location", alias="Office location")
    department: Optional[str] = Field(title="Department", alias="Department")
    annual_salary: Decimal = Field(title="Expected annual salary", alias="Expected annual salary")
    target_bonus: Optional[Decimal] = Field(title="Target bonus", alias="Target bonus", default=None)
    role_start_date: date = Field(title="Current role start date", alias="Current role start date")
    hire_date: date = Field(title="Hire date", alias="Hire date")
    job_band: Optional[str] = Field(title="Job band", alias="Job band")
    salary_currency: Optional[CurrencyEnum] = Field(title="Salary currency", alias="Salary currency",
                                                    default=CurrencyEnum.USD)

    @classmethod
    def human_readable_titles(cls):
        return [field.title for _, field in cls.model_fields.items()]

    @classmethod
    def from_csv(cls, csv_row):
        return cls.model_validate({k: (v if v else None) for k, v in csv_row.items()})


def read_file_rows(in_memory_file):
    reader = csv.DictReader(StringIO(in_memory_file.file.read().decode('utf-8')))
    yield from reader


class EmployeesOnboarding:
    def __init__(self, doc_upload_service: UploadDocumentService, company: Company):
        self.company = company
        self.doc_upload_service = doc_upload_service

    def upload_file(self, in_memory_file, admin_user):
        in_memory_file.file.seek(0)
        content_type = in_memory_file.content_type
        uploaded_document_info: UploadedDocumentInfo = self.doc_upload_service.upload(
            document_data=in_memory_file,
            content_type=in_memory_file.content_type
        )

        document, document_created = Document.objects.update_or_create(
            partner_id=uuid.uuid4().hex,
            company=admin_user.company,
            defaults={
                'content_type': content_type,
                'title': in_memory_file.name,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.BULK_UPDATE_INVESTOR_ACCOUNT_CODE.value,
                'file_date': timezone.now().date(),
                'access_scope': Document.AccessScopeOptions.INVESTOR_ONLY,
                'uploaded_by_admin': admin_user
            }
        )

        EmployeesOnboardingFile.objects.get_or_create(
            document=document,
            uploaded_by=admin_user,
            company=admin_user.company
        )

    def process(self, csvfile):
        valid_rows = []
        errors = []
        successes = []
        company = self.company
        for row in read_file_rows(csvfile):
            try:
                valid_row = EmployeeOnboardRow.from_csv(row)
                valid_rows.append(valid_row)
            except ValidationError as ve:
                errors.append(ve)
                return ProcessOutput(errors=errors, successes=[])

        for valid_row in valid_rows:
            try:
                employment_record_defaults = self.employment_record_defaults(valid_row)
                company_role = CompanyRole.objects.get(company=company, name=valid_row.job_title)
                salary_currency = Currency.objects.get(company=company, code=valid_row.salary_currency)
                defaults = {"first_name": valid_row.first_name,
                            "last_name": valid_row.last_name,
                            "username": valid_row.email}
                with atomic():
                    user, created = RetailUser.objects.update_or_create(email=valid_row.email, defaults=defaults)
                    CompanyUser.objects.update_or_create(user=user, company=company,
                                                         defaults={'partner_id': uuid.uuid4().hex})

                    participant_profile, _ = ParticipantProfile.objects.update_or_create(user=user, company=company)
                    employment_record, _ = EmploymentRecord.objects.update_or_create(company=company,
                                                                                     participant_profile=participant_profile,
                                                                                     defaults=employment_record_defaults)
                    participant_profile.employment_record = employment_record
                    participant_profile.save()
                    position_payload = dict(functional_role=company_role,
                                            company=company,
                                            target_bonus=valid_row.target_bonus,
                                            start_date=valid_row.role_start_date,
                                            salary_currency=salary_currency,
                                            employment_record=employment_record,
                                            annual_salary=valid_row.annual_salary)
                    position_qs = Position.objects.filter(company=company, employment_record=employment_record)
                    if created or not position_qs.exists():
                        Position.objects.create(**position_payload)
                    else:
                        position_qs.update(**position_payload)
                successes.append(valid_row)
            except django.db.Error as e:
                errors.append(str(e))
        return ProcessOutput(errors=errors, successes=successes)

    def employment_record_defaults(self, valid_row):
        defaults = dict()
        company = self.company
        if valid_row.job_band:
            defaults["job_band"] = JobBand.objects.get(company=company, name=valid_row.job_band)

        if valid_row.department:
            defaults["department"] = Department.objects.get(company=company, name=valid_row.department)

        if valid_row.office_location:
            defaults["office_location"] = OfficeLocation.objects.get(company=company, name=valid_row.office_location)

        defaults = {**defaults, **{"hire_date": valid_row.hire_date}}
        return defaults
