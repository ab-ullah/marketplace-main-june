import base64
from django.db.models import Q

from api.agreements.services.application_data.get_application_values import GetApplicationValuesService
from api.applications.models import Application, ApplicationCompanyDocument
from api.applications.serializers import ApplicationCompanyDocumentSerializer
from api.companies.models import CompanyDocument, CompanyUser
from api.documents.services.download_file import download_file_obj
from api.libs.docusign.services import DocumentSigningService
from api.libs.utils.user_name import normalize_email, get_identifier_from_email


class ApplicationCompanyDocumentsService:
    def __init__(self, application: Application):
        self.application = application
        self.company = application.company
        self.user = application.user
        self.company_user = self.get_company_user()

    def get_company_user(self):
        return CompanyUser.objects.get(company=self.company, user=self.user)

    def once_required_documents_completed(self):
        queryset = ApplicationCompanyDocument.objects.filter(
            application__company=self.company,
            company_document__required_once=True,
            application__user=self.user,
            completed=True
        ).values_list('company_document_id', flat=True)
        return list(queryset)

    def get_signer_data_tabs(self, company_document):
        return GetApplicationValuesService(
            application=self.application,
            document=company_document
        ).get_flat()

    def create_docusign_envelope(self, company_document: CompanyDocument):
        user = self.user
        content_bytes = download_file_obj(document=company_document.document).read()
        base64_file_content = base64.b64encode(content_bytes).decode("ascii")
        document_name = company_document.name
        data_tabs = self.get_signer_data_tabs(company_document=company_document)
        envelope_args = {
            "file_name": document_name,
            "file_obj": base64_file_content,
            "document_name": document_name,
            "document_id": company_document.id,
            "email_subject": f'Please sign your {document_name} document',
            'signers': [
                {
                    "signer_email": normalize_email(user.email),
                    "signer_name": get_identifier_from_email(user),
                    "signer_client_id": self.company_user.id,
                    'role_name': 'applicant',
                    'tab_pattern': 'applicant\\*',
                    'data_tabs': data_tabs,
                    'routing_order': 1,
                }
            ]
        }
        if company_document.require_gp_signature and company_document.gp_signer:
            gp_signer_user = company_document.gp_signer.user
            envelope_args['signers'].append(
                {
                    "signer_email": gp_signer_user.email,
                    "signer_name": get_identifier_from_email(gp_signer_user),
                    "signer_client_id": gp_signer_user.id,
                    'role_name': 'gp_signer',
                    'tab_pattern': 'fund-gp_signer\\*',
                    'data_tabs': data_tabs,
                    'routing_order': 2,
                }
            )
        docusign_service = DocumentSigningService()
        results = docusign_service.create_composite_envelope(envelope_args)
        return results.envelope_id

    def get_existing_include_deleted_documents(self):
        once_required_documents_completed_ids = self.once_required_documents_completed()
        return ApplicationCompanyDocument.include_deleted.filter(
            company_document__require_signature=True
        ).filter(
            Q(application=self.application,
              company_document__deleted=False) |
            Q(
                company_document__id__in=once_required_documents_completed_ids,
                company_document__deleted=False,
                application__user=self.user
            )
        )

    def get_documents(self, skip_complete_once_required_docs=False, get_pending_count_only=False):
        existing_documents = ApplicationCompanyDocument.objects.filter(
            application=self.application,
        ).values_list('company_document_id', flat=True)
        existing_document_ids = list(existing_documents)
        once_required_documents_completed_ids = self.once_required_documents_completed()

        for company_document in CompanyDocument.objects.filter(company=self.company, deleted=False):
            if company_document.id in existing_document_ids:
                continue

            if company_document.required_once and company_document.id in once_required_documents_completed_ids:
                continue

            ApplicationCompanyDocument.objects.create(
                application=self.application,
                company_document=company_document,
            )

        if skip_complete_once_required_docs:
            queryset = ApplicationCompanyDocument.objects.filter(
                application=self.application,
                company_document__deleted=False
            )
        else:
            queryset = ApplicationCompanyDocument.objects.filter(
                Q(application=self.application,
                  company_document__deleted=False) |
                Q(
                    company_document__id__in=once_required_documents_completed_ids,
                    company_document__deleted=False,
                    application__user=self.user
                )
            ).distinct('company_document_id').order_by(
                'company_document_id',
                '-completed',
                '-created_at'
            )

        if get_pending_count_only:
            return queryset.filter(completed=False).count()

        return ApplicationCompanyDocumentSerializer(queryset, many=True).data
