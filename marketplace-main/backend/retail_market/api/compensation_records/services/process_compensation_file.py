import uuid
from re import sub

from django.utils import timezone

from api.admin_users.models import AdminUser
from api.compensation_records.models import Cash, InsuranceBenefit, MiscellaneousBenefit, CompensationTax
from api.compensation_records.serializers import CompensationRecordCreateSerializer
from api.compensation_records.services.constants import COMPENSATION_FILE_MAPPINGS, CURRENCY_COLUMNS, SALARY, BONUS, \
    EXTRA_BONUS, MATCH_401K, MEDICAL, DENTAL, VISION, LIFE, AD_AND_D, STD, LTD, SUPPLEMENTAL_LTD, PHONE, MEALS, PARKING, \
    FICA, MEDICARE, FUTA, SUI
from api.currencies.models import Currency
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService
from api.libs.utils.BaseFileProcessingService import BaseFileProcessingService
from api.users.models import RetailUser


class ProcessCompensationFile(BaseFileProcessingService):
    def __init__(self, in_memory_file, admin_user: AdminUser):
        self.admin_user = admin_user
        self.company = admin_user.company
        super().__init__(
            in_memory_file=in_memory_file,
            fund=None,
            document_type=Document.DocumentType.COMPENSATION_FILE.value,
            access_scope=Document.AccessScopeOptions.INVESTOR_ONLY.value,
        )

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
            if mapped_key := COMPENSATION_FILE_MAPPINGS.get(k.strip()):
                parsed_row[mapped_key] = v

        return parsed_row

    @staticmethod
    def convert_currency_to_number(currency, default=0):
        if not currency:
            return default
        return float(sub(r'[^\d.-]', '', currency))

    def clean_data(self, row):
        for field in CURRENCY_COLUMNS:
            if field in row:
                row[field] = self.convert_currency_to_number(currency=row[field], default=0)

    def process_row(self, row):
        mapped_row = self.map_file_row(row=row)
        self.clean_data(row=mapped_row)
        user = self.get_user(email=mapped_row['email'])
        currency = Currency.objects.get(
            code=mapped_row['currency'],
            company=self.company
        )
        mapped_row['user'] = user.id
        mapped_row['company'] = self.company.id
        mapped_row['currency'] = currency.id
        serializer = CompensationRecordCreateSerializer(data=mapped_row)
        if serializer.is_valid(raise_exception=True):
            compensation_record = serializer.save()
        else:
            self.errors.append(serializer.errors)
            return

        Cash.objects.update_or_create(
            compensation_record=compensation_record,
            defaults={
                'salary': mapped_row[SALARY],
                'bonus': mapped_row[BONUS],
                'extra_bonus': mapped_row[EXTRA_BONUS],
                'match_401k': mapped_row[MATCH_401K],
            }
        )

        InsuranceBenefit.objects.update_or_create(
            compensation_record=compensation_record,
            defaults={
                'medical': mapped_row[MEDICAL],
                'dental': mapped_row[DENTAL],
                'vision': mapped_row[VISION],
                'life': mapped_row[LIFE],
                'ad_and_d': mapped_row[AD_AND_D],
                'std': mapped_row[STD],
                'ltd': mapped_row[LTD],
                'supplemental_ltd': mapped_row[SUPPLEMENTAL_LTD],
            }
        )

        MiscellaneousBenefit.objects.update_or_create(
            compensation_record=compensation_record,
            defaults={
                'phone': mapped_row[PHONE],
                'meals': mapped_row[MEALS],
                'parking': mapped_row[PARKING],
            }
        )

        CompensationTax.objects.update_or_create(
            compensation_record=compensation_record,
            defaults={
                'fica': mapped_row[FICA],
                'medicare': mapped_row[MEDICARE],
                'futa': mapped_row[FUTA],
                'sui': mapped_row[SUI],
            }
        )

    def get_user(self, email):
        try:
            return RetailUser.objects.get(email__iexact=email)
        except RetailUser.DoesNotExist:
            self.errors.append(f'User {email} does not exists')
            return None

    def create_document_relation(self, document: Document):
        pass
