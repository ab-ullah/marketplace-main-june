from api.applications.models import Application
from api.workflows.services.approval_service import WorkFlowApprovalService


class SendAllocationApprovalEmailService:
    @staticmethod
    def send_emails(application_ids):
        applications = Application.objects.filter(id__in=application_ids)
        for application in applications:
            if application.status != Application.Status.APPROVED.value:
                continue

            if application.allocation_approval_email_sent:
                continue
            WorkFlowApprovalService().async_send_application_approval_email(application_id=application.id)
            application.allocation_approval_email_sent = True
            application.save(update_fields=['allocation_approval_email_sent'])
