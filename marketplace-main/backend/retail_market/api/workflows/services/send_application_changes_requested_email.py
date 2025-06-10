from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.admin_users.models import AdminUser
from api.funds.models import Fund
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_logo_url, get_fund_application_url
from api.libs.utils.user_name import get_display_name
from api.users.models import RetailUser


CHANGES_REQUESTED_EMAIL_MESSAGE = "email/changes_requested_email_message.html"
CHANGES_REQUESTED_EMAIL_SUBJECT = "Action Required"


class SendChangesRequestedEmail:
    def __init__(self, requested_by: AdminUser, subject_user: RetailUser, fund_external_id: str, fund_name: str, module_name: str):
        self.requested_by = requested_by
        self.subject_user = subject_user
        self.fund_external_id = fund_external_id
        self.fund_name = fund_name
        self.module_name = module_name

    @staticmethod
    def async_send_changes_requested_email(user_id, fund_external_id, fund_name, module_name):
        user = RetailUser.objects.get(id=user_id)
        fund = Fund.objects.get(external_id=fund_external_id)
        context = {
            'logo_url': get_logo_url(company=fund.company),
            'next_step_url': get_fund_application_url(fund_external_id=fund_external_id),
            'user_name': get_display_name(user),
            'fund_name': fund_name,
            'module_name': module_name,
            'program_name': fund.company.company_profile.program_name
        }

        body = render_to_string(CHANGES_REQUESTED_EMAIL_MESSAGE, context).strip()
        email_service = SendEmailService()
        email_service.send_html_email(
            to=user.email,
            subject="{} {}".format(fund_name,CHANGES_REQUESTED_EMAIL_SUBJECT),
            body=body
        )

    def send_changes_requested_email(self):
        async_task(
            self.async_send_changes_requested_email,
            self.subject_user.id,
            self.fund_external_id,
            self.fund_name,
            self.module_name
        )
