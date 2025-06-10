import uuid
from datetime import datetime
from re import sub

from django.utils import timezone
from slugify import slugify

from api.admin_users.models import AdminUser
from api.currencies.models import Currency
from api.currencies.services.fund_currency_info import DEFAULT_CURRENCY
from api.documents.models import Document, UserNoticeDocument
from api.documents.services.upload_document import UploadDocumentService
from api.firms.models import Firm
from api.funds.models import Fund
from api.funds.utils.convert_curreny_to_number import convert_currency_to_number
from api.investors.models import Investor
from api.libs.utils.BaseFileProcessingService import BaseFileProcessingService
from api.notices.serializers import TransactionalConsiderationsCreateSerializer, ValuationConsiderationsCreateSerializer
from api.notices.services.constants import FIRM, FUND, NOTICE_FILE_MAPPINGS, CURRENCY_COLUMNS, CURRENCY, \
    CONVERSION_RATE, VALUATION_FILE_MAPPINGS, VALUATION_FILE_CURRENCY_COLUMNS
from api.users.models import RetailUser


class ProcessConsiderationsFile(BaseFileProcessingService):
    def __init__(self, in_memory_file, admin_user: AdminUser, investor: Investor):
        self.investor = investor
        self.admin_user = admin_user
        self.company = admin_user.company
        super().__init__(
            in_memory_file=in_memory_file,
            fund=None,
            document_type=Document.DocumentType.NOTICE_CONSIDERATIONS.value,
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
            if mapped_key := NOTICE_FILE_MAPPINGS.get(k.strip()):
                parsed_row[mapped_key] = v

        return parsed_row

    def get_firm(self, row):
        firm_name = row.get(FIRM)
        slug = slugify(firm_name)
        firm, _ = Firm.objects.get_or_create(
            slug=slug,
            company=self.company,
            defaults={
                'name': firm_name
            }
        )
        return firm

    def get_fund(self, row):
        fund_name = row.get(FUND)
        slug = slugify(fund_name)
        currency = row.get(CURRENCY)
        if not currency:
            currency = DEFAULT_CURRENCY
        currency = Currency.objects.get(
            company=self.company,
            code__iexact=currency
        )
        fund, _ = Fund.objects.update_or_create(
            company=self.company,
            slug=slug,
            defaults={
                'fund_currency': currency,
                'name': fund_name,

            }
        )
        return fund

    @staticmethod
    def convert_currency_to_number(currency, default=0):
        if not currency:
            return default
        return float(sub(r'[^\d.-]', '', currency))

    def clean_data(self, row):
        for field in CURRENCY_COLUMNS:
            if field in row:
                default = 1 if field == CONVERSION_RATE else 0
                row[field] = self.convert_currency_to_number(currency=row[field], default=default)

    def process_row(self, row):
        mapped_row = self.map_file_row(row=row)
        self.clean_data(row=mapped_row)
        fund = self.get_fund(row=mapped_row)
        firm = self.get_firm(row=mapped_row)
        mapped_row['fund'] = fund.id
        mapped_row['firm'] = firm.id
        mapped_row['company'] = self.company.id
        mapped_row['investor'] = self.investor.id
        mapped_row['investor'] = self.investor.id
        mapped_row['notice_date'] = datetime.strptime(
            mapped_row['notice_date'], '%m/%d/%Y').strftime('%Y-%m-%d')

        serializer = TransactionalConsiderationsCreateSerializer(data=mapped_row)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        else:
            self.errors.append(serializer.errors)

    def get_user(self, email):
        try:
            return RetailUser.objects.get(email__iexact=email)
        except RetailUser.DoesNotExist:
            self.errors.append(f'User {email} does not exists')
            return None

    def create_document_relation(self, document: Document):
        self.object = UserNoticeDocument.objects.create(
            investor=self.investor,
            document=document
        )


class ProcessValuationFile(ProcessConsiderationsFile):
    def clean_data(self, row):
        for field in VALUATION_FILE_CURRENCY_COLUMNS:
            if field in row:
                default = 1 if field == CONVERSION_RATE else 0
                row[field] = self.convert_currency_to_number(currency=row[field], default=default)

    @staticmethod
    def map_file_row(row):
        parsed_row = {}
        for k, v in row.items():
            if mapped_key := VALUATION_FILE_MAPPINGS.get(k.strip()):
                parsed_row[mapped_key] = v

        return parsed_row

    def process_row(self, row):
        mapped_row = self.map_file_row(row=row)
        self.clean_data(row=mapped_row)
        fund = self.get_fund(row=mapped_row)
        firm = self.get_firm(row=mapped_row)
        mapped_row['fund'] = fund.id
        mapped_row['firm'] = firm.id
        mapped_row['company'] = self.company.id
        mapped_row['investor'] = self.investor.id
        mapped_row['notice_date'] = datetime.strptime(
            mapped_row['notice_date'], '%m/%d/%Y').strftime('%Y-%m-%d')

        serializer = ValuationConsiderationsCreateSerializer(data=mapped_row)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        else:
            self.errors.append(serializer.errors)
