from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.applications.models import Application
from api.libs.utils.user_name import get_display_name
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_logo_url, get_fund_application_url

APPLICATION_UPDATED_EMAIL_MESSAGE = "email/application_updated_email_message.html"


class SendApplicationUpdateEmail:
    def __init__(self, application_id):
        self.application_id = application_id

    @staticmethod
    def async_application_updated_email(application_id):
        application = Application.objects.get(id=application_id)
        if not application:
            return
        context = {
            'logo_url': get_logo_url(company=application.company),
            'next_step_url': get_fund_application_url(fund_external_id=application.fund.external_id),
            'fund_name': application.fund.name,
            'user_name': get_display_name(application.user),
            'comment': application.update_comment,
            'program_name': application.company.company_profile.program_name
        }

        body = render_to_string(APPLICATION_UPDATED_EMAIL_MESSAGE, context).strip()
        email_service = SendEmailService()
        email_service.send_html_email(
            to=application.user.email,
            subject=f'{application.fund.name} Action Required',
            body=body
        )

    def send_application_email(self):
        async_task(self.async_application_updated_email, self.application_id)
