import io
import uuid
from datetime import date
from pathlib import Path

from django.template.loader import render_to_string
from weasyprint import HTML

from api.activities.models import TransactionDetail
from api.companies.models import Company
from api.currencies.models import Currency, CurrencyRate
from api.currencies.services.company_currency_details import DEFAULT_CURRENCY
from api.documents.models import Document, InvestorDocument
from api.documents.services.upload_document import UploadDocumentService, UploadedDocumentInfo
from api.funds.models import Fund
from api.interest_statements.constants.interest_rates import INTEREST_RATE_BY_YEAR, CURRENCY_INTEREST_RATE_BY_YEAR
from api.interest_statements.models import InvestorInterestStatement
from api.interest_statements.serializers import QuarterSerializer
from api.interest_statements.services.calculate_interest_statement import CalculateInterestStatementService
from api.investors.models import Investor
from api.libs.utils.date_util import DateUtil
from api.partners.services.create_notification import DocumentNotificationService


class ProcessInvestorService:
    def __init__(self, investor_id: int, quarter_end_date: date, company: Company):
        self.investor_id = investor_id
        self.quarter_end_date = quarter_end_date
        self.investor = self.get_investor()
        self.company = company

    def get_investor(self):
        try:
            return Investor.objects.get(id=self.investor_id)
        except Investor.DoesNotExist:
            return None

    def get_fund_ids(self):
        fund_ids = TransactionDetail.objects.filter(
            investor_id=self.investor_id,
            company=self.company,
            effective_date__lte=self.quarter_end_date
        ).order_by('fund_id').distinct('fund_id').values_list('fund_id', flat=True)
        return list(fund_ids)

    def get_fund_conversion_rate(self, fund: Fund):
        currency = fund.fund_currency  # type:  Currency
        if currency.code == DEFAULT_CURRENCY:
            return 1.0

        base_currency = Currency.objects.get(
            code=DEFAULT_CURRENCY,
            company=fund.company
        )

        return CurrencyRate.objects.filter(
            from_currency=currency,
            to_currency=base_currency,
            rate_date__date=self.quarter_end_date
        ).latest('rate_date').conversion_rate

    @staticmethod
    def get_context_interest_rate(fund_currency: str, year: int):
        if fund_currency in CURRENCY_INTEREST_RATE_BY_YEAR:
            return CURRENCY_INTEREST_RATE_BY_YEAR[fund_currency].get(year)
        return INTEREST_RATE_BY_YEAR.get(year)

    def get_context(self):
        fund_ids = self.get_fund_ids()
        funds = Fund.objects.filter(id__in=fund_ids).order_by('created_at')

        fund_segments = []
        for fund in funds.iterator():
            fund_currency_code = fund.fund_currency.code.upper()
            interest_quarters = CalculateInterestStatementService(
                investor_id=self.investor_id,
                fund_id=fund.id,
                end_date=self.quarter_end_date,
                fund_currency=fund_currency_code
            ).process()
            if not interest_quarters:
                continue
            required_quarter = interest_quarters[-1]
            parsed_quarter = QuarterSerializer(required_quarter).data
            fund_segment = {
                'investment': fund.name,
                'investment_currency': fund_currency_code,
                'investment_currency_symbol': fund.fund_currency.symbol,
                'statements': parsed_quarter['segments'],
                'total_interest': parsed_quarter['total_interest'],
                'base_currency_symbol': '$',
                'translation_rate': self.get_fund_conversion_rate(fund=fund),
                'interest_rate': self.get_context_interest_rate(
                    fund_currency=fund_currency_code,
                    year=parsed_quarter['year']
                )
            }
            fund_segments.append(fund_segment)

        context = {
            'quarter': DateUtil.get_quarter_name(for_date=self.quarter_end_date),
            'date': self.quarter_end_date,
            'investor': self.investor.name,
            'segments': fund_segments
        }
        return context

    @staticmethod
    def create_pdf(context):
        html_str = render_to_string('investor_interest_statement.html', context)
        html = HTML(string=html_str)
        pdf_content = html.write_pdf()
        #Path('sample6.pdf').write_bytes(pdf_content)
        return pdf_content

    def create_notification(self, document: Document):
        notification_service = DocumentNotificationService(
            document=document,
            payload={},
            investor=self.investor,
            skip_notification=False
        )
        notification_service.process_investor(investor=self.investor)

    def create_document(self, pdf_content, quarter):
        content_type = 'application/pdf'
        pdf_file = io.BytesIO(pdf_content)
        uploaded_document_info = UploadDocumentService.upload(
            document_data=pdf_file,
            content_type=content_type
        )  # type: UploadedDocumentInfo

        document_name = f'{self.investor.name}-{quarter}-interest-statement'
        document, document_created = Document.objects.update_or_create(
            partner_id=uuid.uuid4().hex,
            company=self.company,
            defaults={
                'content_type': content_type,
                'title': document_name,
                'extension': uploaded_document_info.extension,
                'document_id': uploaded_document_info.document_id,
                'document_path': uploaded_document_info.document_path,
                'document_type': Document.DocumentType.INTEREST_STATEMENT.value,
                'file_date': self.quarter_end_date,
                'access_scope': Document.AccessScopeOptions.INVESTOR_ONLY,
            }
        )

        investor_document, _ = InvestorDocument.objects.get_or_create(
            document=document,
            investor=self.investor,
        )

        InvestorInterestStatement.objects.update_or_create(
            investor=self.investor,
            statement_date=self.quarter_end_date,
            defaults={
                'document': document
            }
        )
        return document

    def process(self):
        if not self.investor:
            return

        if InvestorInterestStatement.objects.filter(
                investor=self.investor,
                statement_date=self.quarter_end_date
        ).exists():
            return

        context = self.get_context()

        # Skip investments and investors with no data.
        if context['segments'] is not None and len(context['segments']) > 0:
            pdf_content = self.create_pdf(context=context)
            document = self.create_document(pdf_content=pdf_content, quarter=context['quarter'])
            self.create_notification(document=document)
