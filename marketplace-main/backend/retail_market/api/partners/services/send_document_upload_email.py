from django.template.loader import render_to_string
from django_q.tasks import async_task

import logging

from api.notifications.models import UserNotification
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_dashboard_url, get_logo_url

DOCUMENT_CREATED_EMAIL_MESSAGE = "email/document_uploaded_email_message.html"
DOCUMENT_CREATED_EMAIL_SUBJECT = "New Document Published"

logger = logging.getLogger(__name__)


class SendDocumentEmail:
    # TODO: Merge this with the capital call email class
    def __init__(self, document_title, document_type, notification_id):
        self.document_title = document_title
        self.document_type = document_type
        self.notification_id = notification_id

    @staticmethod
    def async_send_document_email(document_title, document_type, notification_id):
        try:
            notification = UserNotification.objects.get(id=notification_id)
            email_service = SendEmailService()
            context = {
                'fund_name': notification.fund.name if notification.fund else None,
                'document_name': document_title,
                'document_type': document_type,
                'program_name': notification.company.company_profile.program_name,
                "dashboard_url": get_dashboard_url(),
                "logo_url": get_logo_url(company=notification.company),
                'support_email': notification.company.company_profile.contact_email,
            }

            body = render_to_string(DOCUMENT_CREATED_EMAIL_MESSAGE, context).strip()
            if notification.user:
                email_service.send_html_email(
                    to=notification.user.user.email,
                    subject=DOCUMENT_CREATED_EMAIL_SUBJECT,
                    body=body
                )
            else:
                for user_investor in notification.investor.associated_users.exclude(company_user__user__deleted=True):
                    email_service.send_html_email(
                        to=user_investor.company_user.user.email,
                        subject=DOCUMENT_CREATED_EMAIL_SUBJECT,
                        body=body
                    )
        except Exception as e:
            logger.exception(e)

    def send_document_email(self):
        async_task(self.async_send_document_email, self.document_title, self.document_type, self.notification_id)
