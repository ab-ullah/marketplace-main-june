import uuid

from dateutil.parser import parse as dt_parse

from api.companies.models import Company, CompanyReportDocument
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService

REPORTS_DATA = [
    {
        'path': './assets/admin_reports/Annual Financial Statements Dec 31 2021.xlsx',
        'date': '2021-12-31',
        'type': 'financial_statements',
        'name': 'Annual Financial Statements Dec 31 2021 Unaudited.xlsx',
        'content_type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
        'path': './assets/admin_reports/Annual Financial Statements Dec 31 2021_Unaudited.pdf',
        'date': '2021-12-31',
        'type': 'financial_statements',
        'name': 'Annual Financial Statements Dec 31 2021 Unaudited.pdf',
        'content_type': 'application/pdf'
    },
    {
        'path': './assets/admin_reports/Fund Accounting Q4 & YTD 2021.xlsx',
        'date': '2021-12-31',
        'type': 'fund_accounting',
        'name': 'Fund Accounting Q4 & YTD 2021.xlsx',
        'content_type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    {
        'path': './assets/admin_reports/Due from_to Q4 & YTD 2021.xlsx',
        'date': '2021-12-31',
        'type': 'due_from_to_investors',
        'name': 'Due from/to Q4 & YTD 2021.xlsx',
        'content_type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
]


class LoadAdminReports:
    def __init__(
            self,
            company: Company,
            vehicle_ids,
            document_model=Document,
            company_report_model=CompanyReportDocument
    ):
        self.company = company
        self.vehicle_ids = vehicle_ids
        self.document_model = document_model
        self.company_report_model = company_report_model

    def process(self):
        vehicle_ids = self.vehicle_ids

        for report in REPORTS_DATA:
            with open(report['path'], 'rb') as file_data:
                uploaded_document_info = UploadDocumentService.upload(
                    document_data=file_data,
                    content_type=report['content_type']
                )

            report_date = dt_parse(report['date']).date()
            document = self.document_model.objects.create(
                partner_id=uuid.uuid4().hex,
                document_id=uploaded_document_info.document_id,
                content_type=uploaded_document_info.content_type,
                title=report['name'],
                extension=uploaded_document_info.extension,
                document_type=Document.DocumentType.REPORT.value,
                company=self.company,
                document_path=uploaded_document_info.document_path,
                file_date=report_date,
                access_scope=Document.AccessScopeOptions.COMPANY.value
            )

            report_document = self.company_report_model.objects.create(
                name=report['name'],
                company=self.company,
                document=document,
                report_date=report_date,
                report_type=report['type']
            )
            report_document.vehicles.set(vehicle_ids)
