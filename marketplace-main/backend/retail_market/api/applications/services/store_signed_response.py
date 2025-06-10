import os

from django.apps import apps
from django.db import transaction

from api.applications.models import Application, ApplicationCompanyDocument
from api.companies.models import Company
from api.documents.models import Document
from api.libs.docusign.services import DocumentSigningService
from api.libs.sidecar_blocks.document_store.document_api import DocumentData


class SignedCompanyDocumentResponseService:
    def __init__(
            self,
            envelope_id: str,
            instance: ApplicationCompanyDocument,
            company: Company,
            document_title: str,
            application: Application,
            gp_signing_completed=None
    ):
        self.envelope_id = envelope_id
        self.instance = instance
        self.company = company
        self.document_title = document_title
        self.upload_context = None
        self.document_api = None
        self.application = application
        self.gp_signing_completed = gp_signing_completed
        self.get_document_api()

    def get_document_api(self):
        config = apps.get_app_config('documents')
        self.upload_context = config.context
        self.document_api = config.document_api

    def process(self):
        with transaction.atomic():
            docusign_service = DocumentSigningService()
            envelope_documents = docusign_service.get_envelope_documents(envelope_id=self.envelope_id)
            file_path = docusign_service.get_document(
                self.envelope_id,
                envelope_documents=envelope_documents
            )

            if not file_path:
                return

            company_user = self.application.get_company_user()

            document_path = self.store_document(file_path)
            if not document_path:
                return

            signed_document = Document.create_pdf_document(
                document_type=Document.DocumentType.COMPANY_DOCUMENT,
                company=self.company,
                title="signed_" + self.document_title,
                document_path=document_path,
                uploaded_by_user=company_user
            )

            file_path = docusign_service.get_document(
                envelope_id=self.envelope_id,
                envelope_documents=envelope_documents,
                certificate=True,
            )
            document_path = self.store_document(file_path)

            if not document_path:
                return

            certificate = Document.create_pdf_document(
                document_type=Document.DocumentType.COMPANY_DOCUMENT,
                company=self.company,
                title='certificate_' + self.document_title,
                document_path=document_path,
                uploaded_by_user=company_user
            )
            self.instance.completed = True
            self.instance.signed_document = signed_document
            self.instance.certificate = certificate
            if self.gp_signing_completed:
                self.instance.gp_signing_complete = True
            self.instance.save()

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
