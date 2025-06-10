import logging

from django.conf import settings
from django.template.loader import render_to_string
from django_q.tasks import async_task

from api.agreements.models import AgreementDocumentWitness
from api.libs.sendgrid.email import SendEmailService
from api.libs.utils.urls import get_logo_url

WITNESS_EMAIL_MESSAGE = "email/witness_email.html"
WITNESS_EMAIL_SUBJECT = "Document signing requested"

logger = logging.getLogger(__name__)


class WitnessEmailService:
    @staticmethod
    def async_send_witness_email(agreement_document_witness_id):
        agreement_document_witness = AgreementDocumentWitness.objects.get(id=agreement_document_witness_id)
        application_witness = agreement_document_witness.witness

        signing_url = f'{settings.FE_APP_URL}/investor/witness/{agreement_document_witness.uuid}/sign/{agreement_document_witness.envelope_id}'
        email_service = SendEmailService()
        context = {
            'witness_name': application_witness.name,
            'applicant_first_name': application_witness.application.kyc_record.first_name,
            'applicant_last_name': application_witness.application.kyc_record.last_name,
            'fund_name': application_witness.application.fund.name,
            'sign_url': signing_url,
            'logo_url': get_logo_url(company=application_witness.application.company),
        }
        body = render_to_string(WITNESS_EMAIL_MESSAGE, context).strip()
        email_service.send_html_email(
            to=application_witness.email,
            subject=WITNESS_EMAIL_SUBJECT,
            body=body
        )
        agreement_document_witness.email_sent = True
        agreement_document_witness.save()

    def send_email(self, agreement_document_witness_id):
        async_task(self.async_send_witness_email, agreement_document_witness_id)
