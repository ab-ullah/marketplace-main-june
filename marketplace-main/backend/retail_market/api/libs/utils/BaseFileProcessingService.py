import csv
import mimetypes
import uuid
from io import StringIO

from api.documents.models import Document
from api.documents.services.upload_document import (UploadDocumentService,
                                                    UploadedDocumentInfo)
from api.funds.models import Fund
from api.libs.excel_parsing.parse_xlsxl import xlsx_to_dicts
from django.utils import timezone


class BaseFileProcessingService:
    CSV_EXT = "csv"
    XLRD_EXT = "xlsx"

    def __init__(self, in_memory_file, fund: Fund, document_type, access_scope):
        self.in_memory_file = in_memory_file
        self.fund = fund
        self.extension = self.get_extension()
        self.buffered_file = None
        self.document_type = document_type
        self.access_scope = access_scope
        self.errors = []
        self.object = None

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
            company=self.fund.company,
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

    def create_document_relation(self, document: Document):
        raise NotImplementedError


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
        raise NotImplementedError

    def process_row(self, row):
        raise NotImplementedError

    def buffer_file(self):
        if self.extension.lower() == self.XLRD_EXT:
            self.buffered_file = xlsx_to_dicts(self.in_memory_file.file)
        elif self.extension.lower() == self.CSV_EXT:
            self.buffered_file = StringIO(self.in_memory_file.file.read().decode('utf-8'))

    def process(self):
        self.buffer_file()
        document = self.create_document()
        self.create_document_relation(document=document)
        for row in self.read_file_rows():
            self.process_row(row)
        return self.object, self.errors
