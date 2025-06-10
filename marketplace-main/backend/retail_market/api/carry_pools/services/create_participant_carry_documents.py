import base64

from api.carry_pools.models import CarryDocument, ParticipantCarryDocument
from api.carry_pools.services.get_carry_document_values import GetCarryValuesService
from api.companies.models import CompanyUser
from api.documents.services.download_file import download_file_obj
from api.libs.docusign.services import DocumentSigningService
from api.libs.utils.user_name import get_identifier_from_email, normalize_email
from api.agreements.constants.gp_signers import GP_SIGNER_CLIENT_ID


class CreateParticipantCarryDocument:
    def __init__(self, participant_carry_document: ParticipantCarryDocument):
        self.participant_carry_document = participant_carry_document

    def get_company_user(self):
        return CompanyUser.objects.get(
            company=self.participant_carry_document.company,
            user=self.participant_carry_document.user
        )

    def get_signer_data_tabs(self):
        return GetCarryValuesService(
            participant_carry_document=self.participant_carry_document
        ).get_flat()

    def get_envelope_payload(self, carry_template_document: CarryDocument):
        document = carry_template_document.document
        user = self.participant_carry_document.user
        company_user = self.get_company_user()
        content_bytes = download_file_obj(document=document).read()
        base64_file_content = base64.b64encode(content_bytes).decode("ascii")
        data_tabs = self.get_signer_data_tabs()
        envelop = {
            "file_name": document.title,
            "file_obj": base64_file_content,
            "document_name": document.title,
            "document_id": carry_template_document.id,
            "email_subject": "Please sign your {} document".format(document.file_name()),
            'signers': [
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
        if carry_template_document.require_gp_signature and carry_template_document.gp_signer:
            gp_signer_user = carry_template_document.gp_signer.user
            envelop['signers'].append({
                "signer_email": f'gp-signers+{gp_signer_user.id}@navable.com',
                "signer_name": f'{gp_signer_user.first_name} {gp_signer_user.last_name}',
                "signer_client_id": GP_SIGNER_CLIENT_ID,
                'role_name': 'gp_signer',
                'tab_pattern': 'fund-gp_signer\\*',
                'data_tabs': data_tabs,
                'routing_order': 2,
            })

        return envelop

    def create_envelope_for_carry_document(self, carry_template_document):
        envelope_args = self.get_envelope_payload(carry_template_document=carry_template_document)
        docusign_service = DocumentSigningService()
        results = docusign_service.create_composite_envelope(envelope_args)
        return results.envelope_id
