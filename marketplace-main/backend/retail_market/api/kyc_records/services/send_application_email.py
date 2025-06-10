from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.kyc_records.models import KYCRecord
from api.libs.sendgrid.email import SendEmailService

APPLICATION_UPDATE_REQUEST_EMAIL_MESSAGE = "email/changes_request.html"


class SendApplicationUpdateEmail:
    def __init__(self, kyc_id):
        self.kyc_id = kyc_id

    @staticmethod
    def async_send_update_request_email(kyc_id):
        kyc_record = KYCRecord.objects.get(id=kyc_id)
        fund_name = kyc_record.workflow.fund.name
        context = {
            'fund_name': fund_name,
        }

        body = render_to_string(APPLICATION_UPDATE_REQUEST_EMAIL_MESSAGE, context).strip()
        subject = f'Changes requested in application for fund: {fund_name}'
        email_service = SendEmailService()

        email_service.send_html_email(
            to=kyc_record.user.email,
            subject=subject,
            body=body
        )

    def send_update_request_email(self):
        async_task(self.async_send_update_request_email, self.kyc_id)
