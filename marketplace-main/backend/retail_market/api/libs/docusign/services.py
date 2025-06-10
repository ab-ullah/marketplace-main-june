import base64
import json
import logging
from os import path

from django.conf import settings
from docusign_esign import EnvelopesApi, RecipientViewRequest, Document, Signer, EnvelopeDefinition, Recipients, Tabs, \
    SignHere, Text, CompositeTemplate, InlineTemplate, Checkbox, TabGroup, DateSigned

from . import create_api_client, get_jwt_token, get_private_key
from api.agreements.services.application_data.constants import CHECKBOX_TYPE, TEXT_FIELD_TYPE, SIGNATURE_TYPE, DATE_TYPE
from api.tax_records.data.tax_forms_data import TAX_FORM_DATA, TEXT_FIELD_STYLE

logger = logging.getLogger(__name__)


class DocumentSigningService:
    PKEY_PATH = settings.DOCU_SIGN['pkey_path']
    SCOPES = [
        "signature"
    ]
    AUTH_SERVER = settings.DOCU_SIGN['auth_server']
    CLIENT_ID = settings.DOCU_SIGN['client_id']
    IMPERSONATED_USER_ID = settings.DOCU_SIGN['impersonated_user_id']
    AUTHENTICATION_METHOD = settings.DOCU_SIGN['authentication_method']

    def __init__(self):
        private_key = get_private_key(self.PKEY_PATH)
        self.token = get_jwt_token(private_key, self.SCOPES, self.AUTH_SERVER, self.CLIENT_ID,
                                   self.IMPERSONATED_USER_ID)
        self.api_client = create_api_client(base_path=self.AUTH_SERVER, oauth_host=self.AUTH_SERVER,
                                            access_token=self.token.access_token)
        user_info = self.api_client.get_user_info(access_token=self.token.access_token)
        accounts = user_info.get_accounts()
        self.account_id = accounts[0].account_id
        self.base_path = accounts[0].base_uri + "/restapi"
        self.api_client.host = self.base_path
        self.envelope_api = EnvelopesApi(self.api_client)

    @staticmethod
    def get_exception_args(args):
        if 'file_obj' in args:
            args.pop('file_obj')
        return json.dumps(args)

    def create_envelope(self, envelope_args):
        envelope_definition = self.make_envelope(envelope_args)
        envelope_api = EnvelopesApi(self.api_client)
        try:
            return envelope_api.create_envelope(account_id=self.account_id, envelope_definition=envelope_definition)
        except Exception as e:
            logger.exception(
                f'Docusign Exception in create_envelope with arguments: {self.get_exception_args(envelope_args)}')
            raise

    @staticmethod
    def get_recipients(envelope_args):
        signers = []

        for signer_info in envelope_args['signers']:
            text_tabs = [Text(tab_label=signer_info['tab_pattern'])]
            checkbox_tabs = []
            signature_tabs = [SignHere(tab_label=signer_info['tab_pattern'])]
            for data_tab in signer_info['data_tabs']['text_tabs']:
                shared = True
                locked = data_tab.get('locked', True)
                required = data_tab.get('required', False)
                if 'gp_signer' in data_tab['id']:
                    if signer_info['role_name'] != 'gp_signer':
                        continue
                    else:
                        shared = False
                        locked = False
                value = data_tab['value']
                text_tabs.append(
                    Text(
                        tab_label=data_tab['id'],
                        locked=locked,
                        value=value,
                        shared=shared,
                        required=required
                    )
                )
            for data_tab in signer_info['data_tabs']['checkbox_tabs']:
                required = data_tab.get('required', False)
                value = data_tab['value']
                checkbox_tabs.append(
                    Checkbox(
                        tab_label=data_tab['id'],
                        selected=value,
                        locked='true',
                        required=required
                    )
                )

            for data_tab in signer_info['data_tabs']['signature_tabs']:
                sign_here = SignHere(tab_label=data_tab['id'], optional=not data_tab['required'])
                if signer_info['role_name'] == 'applicant' and 'gp_signer' not in data_tab['id']:
                    signature_tabs.append(sign_here)
                # I want this condition to be this explicit
                elif signer_info['role_name'] == 'gp_signer' and 'gp_signer' in data_tab['id']:
                    signature_tabs.append(sign_here)

            signer = Signer(
                email=signer_info['signer_email'],
                name=signer_info['signer_name'],
                role_name=signer_info['role_name'],
                recipient_id=signer_info['signer_client_id'],
                client_user_id=signer_info['signer_client_id'],
                tabs=Tabs(
                    sign_here_tabs=signature_tabs,
                    text_tabs=text_tabs,
                    checkbox_tabs=checkbox_tabs
                )
            )
            signers.append(signer)
        return Recipients(signers=signers)

    def create_composite_envelope(self, envelope_args):
        document = Document(
            document_base64=envelope_args['file_obj'],
            name=envelope_args.get("document_name"),
            file_extension="pdf",
            document_id=envelope_args['document_id'],
            transform_pdf_fields=True
        )
        recipients = self.get_recipients(envelope_args=envelope_args)
        composite_template = CompositeTemplate(
            composite_template_id=envelope_args['document_id'],
            inline_templates=[
                InlineTemplate(sequence="1", recipients=recipients)
            ],
            document=document
        )
        envelope_definition = EnvelopeDefinition(
            status="sent",
            composite_templates=[composite_template],
            email_subject="Please fill and sign your document",
        )
        envelope_api = EnvelopesApi(self.api_client)
        try:
            return envelope_api.create_envelope(account_id=self.account_id, envelope_definition=envelope_definition)
        except Exception as e:
            logger.exception(
                f'Docusign Exception in create_composite_envelope with arguments: {self.get_exception_args(envelope_args)}')
            raise

    def get_enveloper_tags(self, envelope_id):
        envelopes_api = EnvelopesApi(self.api_client)
        return envelopes_api.get_form_data(account_id=self.account_id, envelope_id=envelope_id)

    def send_embedded(self, envelope_args):
        envelope_api = EnvelopesApi(self.api_client)
        recipient_view_request = RecipientViewRequest(
            authentication_method=self.AUTHENTICATION_METHOD,
            client_user_id=envelope_args["signer_client_id"],
            recipient_id=envelope_args["signer_client_id"],
            return_url=envelope_args["ds_return_url"],
            user_name=envelope_args["signer_name"],
            email=envelope_args["signer_email"]
        )
        try:
            results = envelope_api.create_recipient_view(
                account_id=self.account_id,
                envelope_id=envelope_args['envelope_id'],
                recipient_view_request=recipient_view_request
            )
        except Exception as e:
            logger.exception(
                f'Docusign Exception in send_embedded with arguments: {self.get_exception_args(envelope_args)}')
            raise

        return {"redirect_url": results.url}

    @staticmethod
    def get_base64_encoded_file(args):
        if args.get('file_obj'):
            content_bytes = args['file_obj']
        else:
            with open(path.join("./assets/tax_forms/", args['file_name']), "rb") as file:
                content_bytes = file.read()
        return base64.b64encode(content_bytes).decode("ascii")

    @staticmethod
    def get_tax_document_tabs(document_name):

        if document_name not in TAX_FORM_DATA:
            return None

        form_data = TAX_FORM_DATA[document_name]
        fields = form_data['fields']
        groups = form_data['groups']
        checkbox_fields = []
        text_fields = []
        sign_fields = []
        date_fields = []
        checkbox_groups = []
        for field in fields:
            if field['type'] == CHECKBOX_TYPE:
                checkbox_fields.append(
                    Checkbox(
                        **field
                    )
                )
            elif field['type'] == TEXT_FIELD_TYPE:
                if 'retain_style' not in field:
                    field.update(TEXT_FIELD_STYLE)
                text_fields.append(
                    Text(
                        **field
                    )
                )
            elif field['type'] == SIGNATURE_TYPE:
                sign_fields.append(
                    SignHere(**field)
                )
            elif field['type'] == DATE_TYPE:
                date_fields.append(
                    DateSigned(**field)
                )

        for group in groups:
            checkbox_groups.append(
                TabGroup(**group)
            )
        return Tabs(
            checkbox_tabs=checkbox_fields,
            tab_groups=checkbox_groups,
            text_tabs=text_fields,
            sign_here_tabs=sign_fields,
            date_tabs=date_fields
        )

    def make_envelope(self, args):
        base64_file_content = self.get_base64_encoded_file(args=args)

        # Create the document model
        document = Document(  # create the DocuSign document object
            document_base64=base64_file_content,
            name=args.get("document_name", "Example document"),  # can be different from actual file name
            file_extension="pdf",  # many different document types are accepted
            document_id=1,  # a label used to reference the doc
            transform_pdf_fields=args.get("transform_pdf_fields", True)
        )

        # Create the signer recipient model
        signer = Signer(
            # The signer
            email=args["signer_email"],
            name=args["signer_name"],
            recipient_id="1",
            routing_order="1",
            tabs=self.get_tax_document_tabs(document_name=args["document_name"]),
            # Setting the client_user_id marks the signer as embedded
            client_user_id=args["signer_client_id"]
        )
        composite_template = CompositeTemplate(
            composite_template_id=1,
            inline_templates=[
                InlineTemplate(sequence="1", recipients=Recipients(signers=[signer]))
            ],
            document=document
        )

        # Next, create the top level envelope definition and populate it.
        if args['document_name'] in TAX_FORM_DATA:
            envelope_definition = EnvelopeDefinition(
                email_subject=args.get('email_subject', "Please fill and sign your document"),
                # The Recipients object wants arrays for each recipient type
                composite_templates=[composite_template],
                recipients=Recipients(signers=[signer]),
                # tabs= signer.tabs,
                status="sent"  # requests that the envelope be created and sent.
            )
        else:
            # keeping this for now as all the tax forms are not done yet
            envelope_definition = EnvelopeDefinition(
                email_subject=args.get('email_subject', "Please fill and sign your document"),
                documents=[document],
                # The Recipients object wants arrays for each recipient type
                recipients=Recipients(signers=[signer]),
                # tabs= signer.tabs,
                status="sent"  # requests that the envelope be created and sent.
            )

        return envelope_definition

    def get_envelope_documents(self, envelope_id):
        envelope_api = EnvelopesApi(self.api_client)
        return envelope_api.list_documents(self.account_id, envelope_id).envelope_documents

    def get_document(self, envelope_id, envelope_documents, certificate=False):
        doc_index = 1 if certificate else 0
        if not envelope_documents or len(envelope_documents) < doc_index + 1:
            return None
        temp_file_path = self.envelope_api.get_document(
            account_id=self.account_id,
            document_id=envelope_documents[doc_index].document_id,
            envelope_id=envelope_id
        )
        return temp_file_path

    def get_envelop_recipients_list(self, envelop_id):
        envelope_api = EnvelopesApi(self.api_client)
        recipients = envelope_api.list_recipients(self.account_id, envelop_id)
        return recipients.to_dict()

