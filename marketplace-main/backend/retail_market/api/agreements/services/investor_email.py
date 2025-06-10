import logging

from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.libs.sendgrid.email import SendEmailService
from api.applications.models import Application
from api.libs.utils.urls import get_dashboard_url, get_logo_url
from api.libs.utils.user_name import get_display_name

INVESTOR_EMAIL_MESSAGE = "email/investor_email.html"

logger = logging.getLogger(__name__)


class InvestorEmailService:
    @staticmethod
    def async_send_investor_email(application_id):
        application = Application.objects.select_related('user').get(id=application_id)
        email_service = SendEmailService()
        context = {
            'user_name': get_display_name(application.user),
            'fund_name': application.fund.name,
            "dashboard_url": get_dashboard_url(),
            "logo_url": get_logo_url(company=application.company),
            "program_name": application.company.company_profile.program_name
        }
        body = render_to_string(INVESTOR_EMAIL_MESSAGE, context).strip()
        email_service.send_html_email(
            to=application.user.email,
            subject=f'{application.fund.name} Document signing completed',
            body=body
        )

    def send_email(self, application_id):
        async_task(self.async_send_investor_email, application_id)
