from api.agreements.constants.related_names import APPLICATION_WITNESS
from api.agreements.models import ApplicantAgreementDocument, AgreementDocumentWitness
from api.agreements.services.witness_email import WitnessEmailService
from api.applications.models import Application


class WitnessDocumentEmailService:
    def __init__(self, application: Application):
        self.application = application

    def has_pending_documents_to_sign(self):
        return ApplicantAgreementDocument.objects.filter(application=self.application).exclude(completed=True).exists()

    def process(self):
        if self.has_pending_documents_to_sign():
            return
        if hasattr(self.application, APPLICATION_WITNESS):
            witness_documents = AgreementDocumentWitness.objects.filter(
                witness=self.application.application_witness,
                email_sent=False
            )
            for witness_document in witness_documents:
                WitnessEmailService().send_email(agreement_document_witness_id=witness_document.id)
