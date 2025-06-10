import base64

from django.db import transaction

from rest_framework.generics import get_object_or_404
from api.agreements.models import ApplicantAgreementDocument, FundAgreementDocument
from api.agreements.services.application_data.get_application_values import GetApplicationValuesService
from api.applications.models import Application
from api.companies.models import CompanyUser
from api.documents.models import FundDocument
from api.documents.services.download_file import download_file_obj
from api.funds.services.application_fund_documents import ApplicationFundDocuments
from api.libs.docusign.services import DocumentSigningService
from api.libs.utils.user_name import get_identifier_from_email, normalize_email
from api.agreements.constants.gp_signers import GP_SIGNER_NAME, GP_SIGNER_CLIENT_ID


class CreateApplicantAgreementDocument:
    def __init__(self, application: Application):
        self.application = application
        self.fund = application.fund

    def get_company_user(self):
        return CompanyUser.objects.get(
            company=self.application.company,
            user=self.application.user
        )

    def get_signer_data_tabs(self, fund_agreement_document):
        return GetApplicationValuesService(application=self.application, document=fund_agreement_document).get_flat()

    def get_envelope_payload(self, fund_agreement_document: FundDocument):
        # witness = self.application.application_witness
        document = fund_agreement_document.document
        user = self.application.user
        company_user = self.get_company_user()
        content_bytes = download_file_obj(document=document).read()
        base64_file_content = base64.b64encode(content_bytes).decode("ascii")
        data_tabs = self.get_signer_data_tabs(fund_agreement_document)
        applicant_agreement_document = get_object_or_404(
            ApplicantAgreementDocument,
            agreement_document=fund_agreement_document,
            application=self.application
        )
        envelop = {
            "file_name": document.title,
            "file_obj": base64_file_content,
            "document_name": document.title,
            "document_id": fund_agreement_document.id,
            "email_subject": "Please sign your {} document".format(document.file_name()),
            'signers': [
                # {
                #     "signer_email": witness.email,
                #     "signer_name": witness.name,
                #     "signer_client_id": witness.id,
                #     'role_name': 'witness',
                #     'tab_pattern': 'witness\\*',
                #     'data_tabs': data_tabs
                # },
                {
                    "signer_email": normalize_email(user.email),
                    "signer_name": get_identifier_from_email(user),
                    "signer_client_id": company_user.id,
                    'role_name': 'applicant',
                    'tab_pattern': 'applicant\\*',
                    'data_tabs': data_tabs,
                    'routing_order': 1,
                }]
        }
        if fund_agreement_document.require_gp_signature and fund_agreement_document.gp_signer:
            gp_signer_user = fund_agreement_document.gp_signer.user
            envelop['signers'].append({
                "signer_email": f'gp-signers+{applicant_agreement_document.id}@navable.com',
                "signer_name": f'{gp_signer_user.first_name} {gp_signer_user.last_name}',
                "signer_client_id": GP_SIGNER_CLIENT_ID,
                'role_name': 'gp_signer',
                'tab_pattern': 'fund-gp_signer\\*',
                'data_tabs': data_tabs,
                'routing_order': 2,
            })

        return envelop

    def create_envelope_for_fund_document(self, fund_agreement_document):
        envelope_args = self.get_envelope_payload(fund_agreement_document=fund_agreement_document)
        docusign_service = DocumentSigningService()
        results = docusign_service.create_composite_envelope(envelope_args)
        return results.envelope_id

    def create(self):
        with transaction.atomic():
            existing_applicant_document_ids = ApplicantAgreementDocument.objects.filter(
                application=self.application
            ).values_list('agreement_document_id', flat=True)
            existing_applicant_document_ids = list(existing_applicant_document_ids)
            signing_documents = ApplicationFundDocuments(application=self.application).get_documents(
                exclude={'id__in': existing_applicant_document_ids},
                require_signature=True,
                require_acknowledgement=True
            )
            for fund_agreement_document in signing_documents:
                # witness = self.application.application_witness

                ApplicantAgreementDocument.objects.create(
                    agreement_document=fund_agreement_document,
                    application=self.application
                )
                # AgreementDocumentWitness.objects.create(
                #     witness=witness,
                #     applicant_agreement_document=applicant_agreement_document,
                #     envelope_id=results.envelope_id
                # )
