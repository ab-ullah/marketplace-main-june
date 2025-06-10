from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.admin_users.models import AdminUser
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_logo_url, get_admin_eligibility_criteria_url, \
    get_admin_application_url
from api.workflows.models import WorkFlow

COMMENT_MENTION_EMAIL_MESSAGE = "email/comment_mention_email_message.html"
COMMENT_MENTION_EMAIL_SUBJECT = "New Mention in Comment"


class SendCommentMentionEmail:
    def __init__(self, user_ids, workflow_id):
        self.user_ids = user_ids
        self.workflow_id = workflow_id

    @staticmethod
    def async_send_comment_email(admin_user_id: int, admin_url: str, company_id:int):
        admin_user = AdminUser.objects.get(id=admin_user_id, company_id=company_id)
        context = {
            'logo_url': get_logo_url(company=admin_user.company),
            'admin_url': admin_url,
        }

        body = render_to_string(COMMENT_MENTION_EMAIL_MESSAGE, context).strip()
        email_service = SendEmailService()

        email_service.send_html_email(
            to=admin_user.user.email,
            subject=COMMENT_MENTION_EMAIL_SUBJECT,
            body=body
        )

    @staticmethod
    def get_workflow_url(workflow: WorkFlow):
        if workflow.module == WorkFlow.WorkFlowModuleChoices.ELIGIBILITY and hasattr(
                workflow,
                'workflow_eligibility_criteria'
        ):
            return get_admin_eligibility_criteria_url(eligibility_criteria=workflow.workflow_eligibility_criteria)

        if hasattr(workflow, 'application'):
            return get_admin_application_url(application=workflow.application)

        return None

    def send_comment_mention_email(self):
        workflow = WorkFlow.objects.get(id=self.workflow_id)
        workflow_url = self.get_workflow_url(workflow=workflow)
        for admin_user_id in AdminUser.objects.filter(
                id__in=self.user_ids,
                company=workflow.company
        ).values_list('id', flat=True):
            async_task(self.async_send_comment_email, admin_user_id, workflow_url, workflow.company_id)
