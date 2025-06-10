import uuid
from re import sub

from dateutil.parser import parse as dt_parse
from django.db.transaction import atomic
from django.utils import timezone

from api.admin_users.models import AdminUser
from api.carry_pools.models import CarryParticipantUser, CarryParticipant
from api.companies.models import CompanyUser
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.employment_records.models import EmploymentRecord, OfficeLocation, CompanyRole, CostCenter, BusinessUnit, \
    Position
from api.employment_records.serializers import OrgImportSerializer
from api.employment_records.services.importer.constants import ORG_HIERARCHY_MAPPING, DATE_FIELDS
from api.investors.models import Investor, CompanyUserInvestor
from api.libs.utils.BaseFileProcessingService import BaseFileProcessingService
from api.participants.models import ParticipantProfile
from api.users.models import RetailUser


class ProcessOrgHierarchyFile(BaseFileProcessingService):
    def __init__(self, in_memory_file, admin_user: AdminUser):
        self.admin_user = admin_user
        self.company = admin_user.company
        super().__init__(
            in_memory_file=in_memory_file,
            fund=None,
            document_type=Document.DocumentType.ORG_HIERARCHY_FILE.value,
            access_scope=Document.AccessScopeOptions.INVESTOR_ONLY.value,
        )
        self.manager_map = {}

    def create_document(self):
        self.in_memory_file.file.seek(0)
        content_type = self.in_memory_file.content_type
        uploaded_document_info = UploadDocumentService.upload(
            document_data=self.in_memory_file,
            content_type=self.in_memory_file.content_type
        )  # type: UploadedDocumentInfo

        self.extension = uploaded_document_info.extension
        document, _ = Document.objects.update_or_create(
            partner_id=uuid.uuid4().hex,
            company=self.admin_user.company,
            defaults={
                'content_type': content_type,
                'title': self.in_memory_file.name,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': self.document_type,
                'file_date': timezone.now().date(),
                'access_scope': self.access_scope,
            }
        )
        return document

    @staticmethod
    def map_file_row(row):
        parsed_row = {}
        for k, v in row.items():
            if mapped_key := ORG_HIERARCHY_MAPPING.get(k.strip()):
                parsed_row[mapped_key] = v

        return parsed_row

    @staticmethod
    def process_date_fields(row):
        for k in list(row.keys()):
            v = row[k]
            if k in DATE_FIELDS:
                if not v:
                    del row[k]
                else:
                    row[k] = dt_parse(v).strftime("%Y-%m-%d")

    def process_row(self, row):
        mapped_row = self.map_file_row(row=row)
        mapped_row['company_id'] = self.company.id
        self.process_date_fields(row=mapped_row)
        company = self.company
        serializer = OrgImportSerializer(data=mapped_row)

        if not serializer.is_valid(raise_exception=False):
            self.errors.append(serializer.errors)
            return

        validated_data = serializer.validated_data

        defaults = {
            "first_name": validated_data['first_name'],
            "last_name": validated_data['last_name'],
            "username": validated_data['email'],
            "email": validated_data['email'],
        }
        with atomic():
            user, created = RetailUser.objects.update_or_create(
                email__iexact=validated_data['email'],
                defaults=defaults
            )
            company_user, _ = CompanyUser.objects.get_or_create(
                user=user,
                company=self.company,
                defaults={'partner_id': uuid.uuid4().hex}
            )

            if validated_data.get('investor_account_code'):
                investor, _ = Investor.objects.get_or_create(
                    partner_id=validated_data['ein'],
                    investor_account_code=validated_data['investor_account_code'],
                    defaults={
                        'name': f"{validated_data['first_name']} {validated_data['last_name']}",
                    }
                )

                CompanyUserInvestor.objects.get_or_create(
                    company_user=company_user,
                    investor=investor
                )

            if not CarryParticipantUser.objects.filter(user=user).exists():
                carry_participant = CarryParticipant.objects.create(
                    first_name=user.first_name if user.first_name else " ",
                    last_name=user.last_name if user.last_name else " ",
                    company=company
                )
                CarryParticipantUser.objects.create(
                    user=user,
                    carry_participant=carry_participant
                )

            participant_profile, _ = ParticipantProfile.objects.update_or_create(
                user=user,
                company=company
            )

            employment_record_defaults = self.employment_record_defaults(validated_data=validated_data)
            employment_record, _ = EmploymentRecord.objects.update_or_create(
                company=company,
                participant_profile=participant_profile,
                defaults=employment_record_defaults
            )
            participant_profile.employment_record = employment_record
            participant_profile.save()

            position_payload = self.get_position_payload(validated_data=validated_data)
            position_payload['employment_record'] = employment_record
            position_qs = Position.objects.filter(company=company, employment_record=employment_record)
            if created or not position_qs.exists():
                Position.objects.create(**position_payload)
            else:
                position_qs.update(**position_payload)

            if manager_ein := validated_data.get('manager_ein'):
                self.manager_map[employment_record.ein] = manager_ein

    def get_user(self, email):
        try:
            return RetailUser.objects.get(email__iexact=email)
        except RetailUser.DoesNotExist:
            self.errors.append(f'User {email} does not exists')
            return None

    def get_position_payload(self, validated_data):
        payload = {
            'title': validated_data.get('title'),
            'start_date': validated_data.get('start_date'),
            'end_date': validated_data.get('end_date'),
            'company': self.company,
        }
        if functional_role := validated_data.get('functional_role'):
            payload['functional_role'] = self.get_or_create(model=CompanyRole, name=functional_role)

        if cost_center := validated_data.get('cost_center'):
            payload['cost_center'] = self.get_or_create(model=CostCenter, name=cost_center)

        if business_unit := validated_data.get('business_unit'):
            payload['business_unit'] = self.get_or_create(model=BusinessUnit, name=business_unit)

        return payload

    def get_or_create(self, model, name):
        instance, _ = model.objects.get_or_create(
            company=self.company,
            name__iexact=name,
            defaults={
                'name': name,
                'company': self.company
            }
        )
        return instance

    def employment_record_defaults(self, validated_data):
        defaults = {
            'ein': validated_data.get('ein'),
            'hire_date': validated_data.get('start_date'),
            'separation_date': validated_data.get('end_date'),
            'company': self.company,
        }
        if office_location := validated_data.get('office_location'):
            defaults["office_location"] = self.get_or_create(model=OfficeLocation, name=office_location)
        return defaults

    def create_manager_relations(self):
        for ein, manager_ein in self.manager_map.items():
            employment_record = EmploymentRecord.objects.get(company=self.company, ein=ein)
            manager_employment_record = EmploymentRecord.objects.get(company=self.company, ein=manager_ein)
            employment_record.manager = manager_employment_record
            employment_record.save()

    def process(self):
        self.buffer_file()
        self.create_document()
        for row in self.read_file_rows():
            self.process_row(row)
        self.create_manager_relations()
        return self.object, self.errors
