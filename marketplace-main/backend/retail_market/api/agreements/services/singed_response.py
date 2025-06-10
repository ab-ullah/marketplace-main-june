import os

from django.apps import apps
from django.db import transaction

from api.agreements.models import ApplicantAgreementDocument
from api.applications.models import Application
from api.companies.models import Company
from api.companies.models import CompanyUser
from api.documents.models import Document
from api.libs.docusign.services import DocumentSigningService
from api.libs.sidecar_blocks.document_store.document_api import DocumentData


class SignedResponseService:

    def __init__(self, envelope_id: str, company: Company, document_title: str):
        self.document_api = None
        self.upload_context = None
        self.envelope_id = envelope_id
        self.company = company
        self.document_title = document_title
        self.get_document_api()

    def get_document_api(self):
        config = apps.get_app_config('documents')
        self.upload_context = config.context
        self.document_api = config.document_api

    def store_document(self, path):
        if not (self.upload_context and self.document_api):
            return

        if os.path.exists(path):
            with open(path, 'rb') as fh:
                document_data = DocumentData("application/pdf", fh)
                document_path = self.document_api.upload(self.upload_context, document_data)
            os.remove(path)
            return document_path
        return None

    def process(self):
        docusign_service = DocumentSigningService()
        envelope_documents = docusign_service.get_envelope_documents(envelope_id=self.envelope_id)
        file_path = docusign_service.get_document(
            self.envelope_id,
            envelope_documents=envelope_documents
        )

        if not file_path:
            return

        document_path = self.store_document(file_path)
        if not document_path:
            return

        signed_document = Document.create_pdf_document(
            document_type=Document.DocumentType.FUND_AGREEMENT_DOCUMENT,
            company=self.company,
            title="signed_" + self.document_title,
            document_path=document_path,
            uploaded_by_user=self.company_user
        )

        # CreateNotificationFromApplicationDocument(
        #     application=self.application,
        #     document=signed_document
        # ).create_notification()

        file_path = docusign_service.get_document(
            envelope_id=self.envelope_id,
            envelope_documents=envelope_documents,
            certificate=True,
        )
        document_path = self.store_document(file_path)

        if not document_path:
            return

        certificate = Document.create_pdf_document(
            document_type=Document.DocumentType.FUND_AGREEMENT_DOCUMENT,
            company=self.company,
            title='certificate_' + self.document_title,
            document_path=document_path,
            uploaded_by_user=self.company_user
        )
        return signed_document, certificate


class SignedAgreementResponseService(SignedResponseService):
    def __init__(self, envelope_id: str, instance: ApplicantAgreementDocument, company: Company, document_title: str,
                 application: Application):
        super().__init__(envelope_id, company, document_title)
        self.instance = instance
        self.application = application
        self.company_user = CompanyUser.objects.get(
            company=self.application.company,
            user=self.application.user
        )

    def process(self):
        with transaction.atomic():
            signed_document, certificate = super().process()
            self.instance.completed = True
            self.instance.signed_document = signed_document
            self.instance.certificate = certificate
            self.instance.save()
