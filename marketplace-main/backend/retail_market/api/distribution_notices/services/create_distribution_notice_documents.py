import io
import uuid

from django.template.loader import render_to_string
from django.utils import timezone
from django_q.tasks import async_task
from weasyprint import HTML

from api.distribution_notices.models import DistributionNotice
from api.documents.models import Document
from api.documents.services.upload_document import UploadDocumentService


class CreateDistributionNoticeDocuments:
    def __init__(self, distribution_notice: DistributionNotice):
        self.distribution_notice = distribution_notice
        self.fund = distribution_notice.fund
        self.company = self.fund.company

    def create_notices(self):
        distribution_notice_details = self.distribution_notice.distribution_notice_details.all()

        for distribution_notice_detail in distribution_notice_details:

            user = distribution_notice_detail.user
            company_user = user.associated_company_users.get(company=self.company)

            context = self.get_distribution_notice_context(distribution_notice_detail, user, company_user)
            async_task(
                CreateDistributionNoticeDocuments.async_generate_pdf,
                context,
                company_user,
                self.distribution_notice,
                distribution_notice_detail,
                ack_failure=False
            )

    @staticmethod
    def async_generate_pdf(context, company_user, distribution_notice, distribution_notice_detail):
        html_str = render_to_string('distribution_notice_template.html', context)
        html = HTML(string=html_str)
        pdf_content = html.write_pdf()
        document = CreateDistributionNoticeDocuments.create_document(
            pdf_content=pdf_content,
            user_name=context['full_name'],
            company_user=company_user,
            distribution_notice=distribution_notice
        )
        distribution_notice_detail.document = document
        distribution_notice_detail.save()

    def get_distribution_notice_context(self, distribution_notice_detail, user, company_user):

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
            'amount': distribution_notice_detail.amount,
            'investments': distribution_notice_detail.investments,
            'management_fees': distribution_notice_detail.management_fees,
            'organization_cost': distribution_notice_detail.organization_cost,
            'fund_expenses': distribution_notice_detail.fund_expenses,
            'interest': distribution_notice_detail.interest,
            'unpaid_commitment': distribution_notice_detail.unpaid_commitment,
            'previously_contributed': distribution_notice_detail.previously_contributed,
            'partner_commitment': distribution_notice_detail.partner_commitment,
            'total_amount_due': distribution_notice_detail.total_amount_due,
            'currency_symbol': self.fund.fund_currency.symbol,
            'subtotal': self.get_subtotal(distribution_notice_detail)
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
    def get_subtotal(distribution_notice_detail):
        sub_total = 0
        sub_total += distribution_notice_detail.investments if distribution_notice_detail.investments else 0
        sub_total -= distribution_notice_detail.management_fees if distribution_notice_detail.management_fees else 0
        sub_total -= distribution_notice_detail.organization_cost if distribution_notice_detail.organization_cost else 0
        sub_total -= distribution_notice_detail.fund_expenses if distribution_notice_detail.fund_expenses else 0

        return sub_total

    @staticmethod
    def get_user_name(user):
        return user.full_name if user.full_name else f'{user.first_name} {user.last_name}'

    @staticmethod
    def create_document(pdf_content, user_name, company_user, distribution_notice):
        content_type = 'application/pdf'
        pdf_file = io.BytesIO(pdf_content)
        uploaded_document_info = UploadDocumentService.upload(
            document_data=pdf_file,
            content_type=content_type
        )  # type: UploadedDocumentInfo

        document_name = f'{user_name}-notice'
        document = Document.objects.create(
            partner_id=uuid.uuid4().hex,
            company=distribution_notice.fund.company,
            content_type=content_type,
            title=document_name,
            extension=uploaded_document_info.extension,
            document_id=uploaded_document_info.document_id,
            document_path=uploaded_document_info.document_path,
            document_type=Document.DocumentType.DISTRIBUTIONS.value,
            file_date=timezone.now(),
            access_scope=Document.AccessScopeOptions.USER_ONLY,
            uploaded_by_user=company_user
        )
        return document
