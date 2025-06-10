import csv
import mimetypes
import uuid
from io import StringIO

from django.utils import timezone

from api.admin_users.models import AdminUser
from api.documents.models import Document, FundInviteDocument
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.funds.constants import INVITE_FILE_MAPPINGS
from api.funds.models import Fund
from api.funds.services.invite_user import InviteUserToFund
from api.funds.validation_serializers import InviteFileRowSerializer
from api.investors.services.validate_investor_user_relation import InvalidInvestorUserRelationException
from api.libs.excel_parsing.parse_xlsxl import xlsx_to_dicts


class ProcessInviteFileService:
    CSV_EXT = "csv"
    XLRD_EXT = "xlsx"

    def __init__(self, in_memory_file, fund: Fund, uploaded_by: AdminUser):
        self.in_memory_file = in_memory_file
        self.fund = fund
        self.uploaded_by = uploaded_by
        self.extension = self.get_extension()
        self.buffered_file = None

    def upload_file(self):
        self.in_memory_file.file.seek(0)
        content_type = self.in_memory_file.content_type
        uploaded_document_info = UploadDocumentService.upload(
            document_data=self.in_memory_file,
            content_type=self.in_memory_file.content_type
        )  # type: UploadedDocumentInfo

        self.extension = uploaded_document_info.extension
        document, document_created = Document.objects.update_or_create(
            partner_id=uuid.uuid4().hex,
            company=self.fund.company,
            defaults={
                'content_type': content_type,
                'title': self.in_memory_file.name,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.FUND_INVITE_DOCUMENT.value,
                'file_date': timezone.now().date(),
                'access_scope': Document.AccessScopeOptions.INVESTOR_ONLY,
                'uploaded_by_admin': self.uploaded_by
            }
        )

        FundInviteDocument.objects.get_or_create(
            document=document,
            fund=self.fund
        )

    def get_extension(self):
        content_type = self.in_memory_file.content_type
        extension = mimetypes.guess_extension(content_type)
        if extension:
            extension = extension.strip('.')
        return extension

    def get_excel_file_reader(self):
        return self.buffered_file

    def get_csv_reader(self):
        return csv.DictReader(self.buffered_file)

    def read_file_rows(self):
        if not self.extension:
            return

        if self.extension.lower() == 'csv':
            reader = self.get_csv_reader()
        else:
            reader = self.get_excel_file_reader()

        if not reader:
            return

        yield from reader

    @staticmethod
    def map_file_row(row):
        parsed_row = {}
        for k, v in row.items():
            if mapped_key := INVITE_FILE_MAPPINGS.get(k.strip()):
                parsed_row[mapped_key] = v

        return parsed_row

    def process_invites(self):
        errors = []

        for row in self.read_file_rows():
            try:
                mapped_row = self.map_file_row(row=row)
                mapped_row['fund_id'] = self.fund.id
                serializer = InviteFileRowSerializer(data=mapped_row)
                if not serializer.is_valid(raise_exception=False):
                    errors.append(serializer.errors)
                    return errors

                InviteUserToFund(
                    invite_row=self.map_file_row(row),
                    fund=self.fund
                ).process()
            except InvalidInvestorUserRelationException:
                errors.append(
                    [
                        {'investor_account_code': f'Invalid investor account code for user: {row.get("Email Address")}'}
                    ]
                )
                return errors

    def buffer_file(self):
        if self.extension.lower() == self.XLRD_EXT:
            self.buffered_file = xlsx_to_dicts(self.in_memory_file.file)
        elif self.extension.lower() == self.CSV_EXT:
            self.buffered_file = StringIO(self.in_memory_file.file.read().decode('utf-8'))

    def process(self):
        self.buffer_file()
        self.upload_file()
        return self.process_invites()
