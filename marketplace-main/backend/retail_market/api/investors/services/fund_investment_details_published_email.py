import logging

from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.funds.models import Fund
from api.funds.utils.get_fund_investor_emails import get_fund_user_emails
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_dashboard_url, get_logo_url

logger = logging.getLogger(__name__)

INVESTMENT_PUBLISHED_EMAIL_MESSAGE = "email/fund_published_email_message.html"
INVESTMENT_PUBLISHED_EMAIL_SUBJECT = "New Information in your Employee Co-Investment Portal"


class FundInvestorDetailsPublishedEmailService:
    def __init__(self, fund_id):
        self.fund_id = fund_id

    @staticmethod
    def async_send_email(fund_id):
        fund = Fund.objects.get(id=fund_id)
        if not hasattr(fund.company, 'company_profile'):
            logger.exception('Company profile is missing')
            return

        company_profile = fund.company.company_profile
        program_name = company_profile.program_name
        support_email = company_profile.contact_email
        context = {
            'fund_name': fund.name,
            'program_name': program_name,
            'dashboard_url': get_dashboard_url(),
            'support_email': support_email,
            'logo_url': get_logo_url(company=fund.company)
        }

        body = render_to_string(INVESTMENT_PUBLISHED_EMAIL_MESSAGE, context).strip()
        email_set = get_fund_user_emails(fund=fund)

        email_service = SendEmailService()
        for email in email_set:
            email_service.send_html_email(
                to=email,
                subject=INVESTMENT_PUBLISHED_EMAIL_SUBJECT,
                body=body
            )

    def send_investment_published_email(self):
        async_task(self.async_send_email, self.fund_id)
