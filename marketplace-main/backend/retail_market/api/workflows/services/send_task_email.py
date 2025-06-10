from django.template.loader import render_to_string
from django_q.tasks import async_task


from api.workflows.models import Task
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_admin_url, get_logo_url

TASK_ASSIGNED_EMAIL_MESSAGE = "email/task_assigned_email_message.html"
TASK_ASSIGNED_EMAIL_SUBJECT = "New Task Assigned"


class SendTaskEmail:
    def __init__(self, task_id, company):
        self.task_id = task_id
        self.company = company

    @staticmethod
    def async_send_task_added_email(task_id, company):
        task = Task.objects.get(id=task_id)
        context = {
            'task_name': task.workflow.name,
            'logo_url': get_logo_url(company),
            'admin_url': get_admin_url(),
            'task_due_date': task.due_date.date(),
        }

        body = render_to_string(TASK_ASSIGNED_EMAIL_MESSAGE, context).strip()
        email_service = SendEmailService()
        if task.assigned_to:
            email_service.send_html_email(
                to=task.assigned_to.user.email,
                subject=TASK_ASSIGNED_EMAIL_SUBJECT,
                body=body
            )

    def send_task_added_email(self):
        async_task(self.async_send_task_added_email, self.task_id, self.company)
