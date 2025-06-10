import io
import uuid

from django.template.loader import render_to_string
from django.utils import timezone
from django_q.tasks import async_task
from weasyprint import HTML

from api.capital_calls.models import FundCapitalCall
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService


class CreateCapitalCallNotice:
    def __init__(self, capital_call: FundCapitalCall):
        self.capital_call = capital_call
        self.fund = capital_call.fund
        self.company = self.fund.company

    def create_notices(self):
        capital_call_details = self.capital_call.capital_call_details.select_related(
            'user'
        ).prefetch_related(
            'user__associated_company_users'
        ).all()

        for capital_call_detail in capital_call_details:

            user = capital_call_detail.user
            company_user = user.associated_company_users.get(company=self.company)

            context = self.get_capital_call_notice_context(capital_call_detail, user, company_user)
            async_task(
                CreateCapitalCallNotice.async_generate_pdf,
                context,
                company_user,
                self.capital_call,
                capital_call_detail,
                ack_failure=False
            )

    @staticmethod
    def async_generate_pdf(context, company_user, capital_call, capital_call_detail):
        html_str = render_to_string('capital_call_template.html', context)
        html = HTML(string=html_str)
        pdf_content = html.write_pdf()
        document = CreateCapitalCallNotice.create_document(
            pdf_content=pdf_content,
            user_name=context['full_name'],
            company_user=company_user,
            capital_call=capital_call
        )
        capital_call_detail.notice = document
        capital_call_detail.save()

    def get_capital_call_notice_context(self, capital_call_detail, user, company_user):

        company_logo = self.company.logo.url if self.company.logo else ''

        context = {
            'company_logo': company_logo,
            'company_name': self.company.name,
            'company_address_street1': '',
            'company_address_street2': '',
            'company_address_city': '',
            'company_address_state': '',
            'company_address_country': '',
            'company_address_zipcode': '',
            'fund_name': self.fund.name,
            'full_name': self.get_user_name(user),
            'partner_id': company_user.partner_id,
            'amount': capital_call_detail.amount,
            'investments': capital_call_detail.investment,
            'management_fees': capital_call_detail.management_fees,
            'organization_cost': capital_call_detail.organization_cost,
            'fund_expenses': capital_call_detail.fund_expenses,
            'total_amount_due': capital_call_detail.total_amount_due,
            'unpaid_commitment': capital_call_detail.unpaid_commitment,
            'previously_contributed': capital_call_detail.previously_contributed,
            'partner_commitment': capital_call_detail.partner_commitment,
            'currency_symbol': self.fund.fund_currency.symbol,
            'due_date': self.capital_call.due_date,
        }
        address = self.company.address

        if address:
            context.update({
                'company_address_street1': address.street1,
                'company_address_street2': address.street2,
                'company_address_city': address.city,
                'company_address_state': address.state.name,
                'company_address_country': address.country.name,
                'company_address_zipcode': address.zip_code,
            })

        return context

    @staticmethod
    def get_user_name(user):
        return user.full_name if user.full_name else f'{user.first_name} {user.last_name}'

    @staticmethod
    def create_document(pdf_content, user_name, company_user, capital_call):
        content_type = 'application/pdf'
        pdf_file = io.BytesIO(pdf_content)
        uploaded_document_info = UploadDocumentService.upload(
            document_data=pdf_file,
            content_type=content_type
        )  # type: UploadedDocumentInfo

        document_name = f'{user_name}-notice'
        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            company=capital_call.fund.company,
            content_type=content_type,
            title=document_name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.CAPITAL_CALL.value,
            file_date=timezone.now(),
            access_scope=Document.AccessScopeOptions.USER_ONLY,
            uploaded_by_user=company_user
        )
        return document