import logging

from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_logo_url, get_carry_docs_url

from api.users.models import RetailUser

CARRY_DOCUMENT_EMAIL_BODY = "email/carry_document_email.html"
CARRY_DOCUMENT_EMAIL_SUBJECT = "New Carry Document in your Employee Co-Investment Portal"


logger = logging.getLogger(__name__)


class CarryEmailService:
    def __init__(self, carry_document_name, user_id, carry_plan, company):
        self.carry_document_name = carry_document_name
        self.user_id = user_id
        self.carry_plan = carry_plan
        self.company = company

    def send_email(self):
        async_task(
            self.async_carry_document_email_alert,
            self.carry_document_name,
            self.user_id,
            self.carry_plan,
            self.company
        )

    @staticmethod
    def async_carry_document_email_alert(carry_document_name, user_id, carry_plan, company):
        user = RetailUser.objects.get(pk=user_id)
        full_name = user.get_full_name()

        email_service = SendEmailService()
        context = {
            'user_name': full_name,
            "dashboard_url": get_carry_docs_url(),
            "logo_url": get_logo_url(company=company),
            'doc_name': carry_document_name,
            'carry_plan': carry_plan,
            "program_name": company.company_profile.program_name
        }
        body = render_to_string(CARRY_DOCUMENT_EMAIL_BODY, context).strip()
        email_service.send_html_email(
                to=user.email,
                subject=CARRY_DOCUMENT_EMAIL_SUBJECT,
                body=body
        )
        logger.info("Carry Document Email Sent Successfully")
