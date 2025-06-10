import logging

from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.companies.models import CompanyProfile
from api.funds.models import Fund
from api.funds.utils.get_fund_investor_emails import get_fund_user_emails
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_dashboard_url, get_logo_url

PUBLISHED_FUND_EMAIL_MESSAGE = "email/fund_published_email_message.html"
PUBLISHED_FUND_EMAIL_SUBJECT = "New Information in your Employee Co-Investment Portal"

logger = logging.getLogger(__name__)


class FundPublishingService:
    def __init__(self, fund: Fund):
        self.fund = fund

    def update_fund(self):
        self.fund.is_published = True
        self.fund.save()

    def send_email_alerts(self):
        async_task(self.async_fund_publish_email_alert, self.fund.id)

    @staticmethod
    def async_fund_publish_email_alert(fund_id: int):
        fund = Fund.objects.get(id=fund_id)

        try:
            company_profile = fund.company.company_profile
        except CompanyProfile.DoesNotExist as e:
            logger.exception('Company profile is missing')
            return

        program_name = company_profile.program_name
        support_email = company_profile.contact_email
        context = {
            'fund_name': fund.name,
            'program_name': program_name,
            'dashboard_url': get_dashboard_url(),
            'support_email': support_email,
            'logo_url': get_logo_url(company=fund.company)
        }

        # We can render once since there is nothing investor specific in this template.
        body = render_to_string(PUBLISHED_FUND_EMAIL_MESSAGE, context).strip()
        email_set = get_fund_user_emails(fund=fund)

        email_service = SendEmailService()
        for email in email_set:
            email_service.send_html_email(
                to=email,
                subject=PUBLISHED_FUND_EMAIL_SUBJECT,
                body=body
            )

    def publish(self):
        self.update_fund()
        self.send_email_alerts()
        return self.fund
