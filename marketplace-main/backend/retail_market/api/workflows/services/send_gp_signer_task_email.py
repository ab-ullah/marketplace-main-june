from django.template.loader import render_to_string
from django_q.tasks import async_task


from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_admin_url, get_logo_url

TASK_ASSIGNED_EMAIL_MESSAGE = "email/gp_task_email_message.html"
TASK_ASSIGNED_EMAIL_SUBJECT = "New Task Assigned"


class SendGPTaskEmail:
    def __init__(self, recipients, task_name, due_date, company):
        self.recipients = recipients
        self.task_name = task_name
        self.due_date = due_date
        self.company = company

    @staticmethod
    def async_send_task_added_email(email, task_name, due_date, company):
        context = {
            'task_name': task_name,
            'logo_url': get_logo_url(company),
            'admin_url': get_admin_url(),
            'task_due_date': due_date,
        }

        body = render_to_string(TASK_ASSIGNED_EMAIL_MESSAGE, context).strip()
        email_service = SendEmailService()
        email_service.send_html_email(
            to=email,
            subject=TASK_ASSIGNED_EMAIL_SUBJECT,
            body=body
        )

    def send_gp_task_added_email(self):
        for recipient in self.recipients:
            async_task(self.async_send_task_added_email, recipient, self.task_name, self.due_date, self.company)
