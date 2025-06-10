from copy import deepcopy

from api.cards.default.individual_cards import PERSONAL_CARD
from api.constants.id_documents import IdDocuments
from api.kyc_records.models import KYCInvestorType

CERTIFICATE_UPLOAD_CARD = {
    "card_id": 'aml-kyc-limited-partnership-certificate-uploads',
    "name": 'Partnership Documents',
    "order": 6,
    "kyc_investor_type": KYCInvestorType.LIMITED_PARTNERSHIP,
    "schema": [
        {
            "id": "limited-partnership-certificates_section",
            "type": "section_header",
            "label": "Certified copies required",
            "data": {
                "size": "medium"
            },
            "helpText": {
                "heading": "",
                "description": (
                        '\'Certified copies\' means that copies of documentation must be certified by a lawyer, accountant, director or officer of a regulated financial services provider, police officer, embassy or consular official or notary public. The certifier must confirm that they have viewed the original documentation and that the photocopy is a true copy of the original. The words "certified true copy"' +
                        'must be included and the document must be signed and dated, and include details of the certifiers capacity (e.g. lawyer), contact address, telephone number, registration number and stamp (if applicable)')
            }
        },
        {
            "id": 'certified_copy_of_partnership_agreement',
            "label": 'Certified copy of Partnership Agreement, Deed or other document ',
            "type": 'file_upload',
            "required": True,
            "helpText": "Please provide a certified copy of your Partnership Agreement, Deed or other document outlining the Limited Partnership terms",
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']}
        },
        {
            "id": 'certificate_of_formation',
            "label": 'Certificate of Formation or jurisdictional equivalent',
            "helpText": "Upload a Certificate of Formation or jurisdictional equivalent",
            "required": True,
            "type": 'file_upload',
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']}
        },
        {
            "id": 'list_of_directors_or_managers_of_partner',
            "label": 'List of current directors / managers of the General Partner',
            "helpText": "Upload list of current directors / managers of the General Partner",
            "required": True,
            "type": 'file_upload',
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']}
        },
        {
            "id": 'list_of_authorized_signatories',
            "label": 'List of authorized signatories',
            "helpText": "Upload list of authorized signatories",
            "required": True,
            "type": 'file_upload',
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']}
        },
        {
            "id": 'list_of_shareholders_members_owners',
            "label": 'List of shareholders / members / owners',
            "helpText": "Upload list of shareholders / members / owners",
            "required": True,
            "type": 'file_upload',
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']}
        },
        {
            "id": 'applicable_resolutions_power_of_attorney_auth_letter',
            "label": 'Any applicable resolutions, powers of attorney or authorisation letters authorizing the investor’s investment (if applicable)',
            "helpText": "Any applicable resolutions, powers of attorney or authorisation letters authorizing the investor’s investment (if applicable)",
            "required": False,
            "type": 'file_upload',
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']}
        }
    ]
}

COMPANY_TYPE_CARD = {
    "card_id": 'aml-kyc-limited-partnership-private_company_selection',
    "name": 'A Partnership',
    "order": 4,
    "kyc_investor_type": KYCInvestorType.LIMITED_PARTNERSHIP,
    "schema": [
        {
            "id": "entity_name",
            "label": "What is the name of your entity?",
            "type": "text",
            "required": True,
            "data": {

            }
        },
        {
            "id": "general_partnership_is_a_private_company",
            "label": "Is the General Partner a Private Company?",
            "type": "radio-select",
            "required": True,
            "data": {
                "options": [
                    {"label": "Yes", "value": "t"},
                    {"label": "No", "value": "f"}
                ]
            }
        },
        {
            "id": "date_of_formation",
            "type": "date",
            "label": "Date of Formation",
            "data": {
                "afterToday": False,
            },
            'required': True,
        },
        {
            'id': 'jurisdiction', 'label': 'Jurisdiction', 'type': 'select-country',
            'required': True,
            "data": {
                "options": []
            }
        },
        {
            "id": "jurisdiction_state",
            "label": "State",
            "type": "custom-select",
            "required": True,
            "data": {
                "options": []
            },
            "field_dependencies": [
                {
                    "field": "jurisdiction",
                    "relation": "equals",
                    "value": 0
                }
            ]
        },
        {
            "id": 'certified_copy_of_partnership_agreement_for_general_partnership',
            "label": 'Upload a certified copy of your partnership agreement',
            "type": 'file_upload',
            "helpText": "Upload a partnership Agreement or equivalent which evidences the appointment of the General Partnership to the Limited Partnership ",
            "required": True,
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']},
            "field_dependencies": [{
                "field": "general_partnership_is_a_private_company",
                "value": "t",
                "relation": "equals"
            }]
        },
    ]
}

PARTICIPANTS_CARD = {
    "card_id": 'aml-kyc-limited-partnership-card-private-company-participants',
    "name": 'Participant information',
    "order": 5,
    "kyc_investor_type": KYCInvestorType.PARTICIPANT,
    "is_repeatable": True,
    "schema": [
        {
            "id": 'proof_of_identity-section',
            "type": 'section_header',
            "label": 'Please provide the following information for at least two entity directors and ALL shareholders that own 25% or more of the shares in the company.',
            "data": {"size": 'medium'}
        },
        {
            "id": "first_name",
            "label": "First name",
            "type": "text",
            "required": True,
            "data": {"placeholder": "First name"}
        },
        {
            "id": "last_name",
            "label": "Last name",
            "type": "text",
            "required": True,
            "data": {"placeholder": "Last name"}
        },
        {
            "id": "occupation",
            "label": "Occupation",
            "type": "text",
            "required": True,
            "data": {
                "placeholder": "Occupation"
            }
        },
        {
            'id': 'id_issuing_country', 'label': 'Issuing Country', 'type': 'select-country',
            "data": {}
        },
        {
            "id": "id_expiration_date",
            "type": "date",
            "label": "ID Expiration",
            "data": {
                "afterToday": True,
            },
            "required": True,
            "field_dependencies": [
                {
                    "field": "id_document_type",
                    "relation": "in",
                    "value": [IdDocuments.PASSPORT.value, IdDocuments.DRIVERS_LICENSE.value],
                }
            ]
        },
        {
            "id": "number_of_id",
            "type": "text",
            "label": "Identification Number for the ID",
            "required": True,
            "data": {
                "placeholder": "Identification Number for the ID"
            },
            "helpText": {
                "heading": "",
                "description": 'Unique identification number (such as an identity card number, birth certificate number or passport number).'
            },
        },
        {
            "id": "id_doc_image",
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']},
            "type": "file_upload",
            "required": True,
            "label": "ID Document Image",
        },
        {
            "id": "source_of_wealth",
            "data": {
                "multiline": True,
                "maxLength": 500,
            },
            "type": "text",
            "label": "Source of Wealth",
            "helpText": "A written description of how the individual's wealth was acquired including details of occupation, investments, names of entities owned or controlled, and any assets inherited",
            "required": True
        }
    ]
}


ENTITY_INFO_CARD = {
    "card_id": 'aml-kyc-limited-partnership-card-3',
    "name": 'Ownership Structure',
    "order": 7,
    "kyc_investor_type": KYCInvestorType.LIMITED_PARTNERSHIP,
    "schema": [
        {
            "id": 'evidence_of_beneficial_ownership',
            "label": "Provide evidence of beneficial ownership structure of the Limited Partnership",
            "type": 'file_upload',
            "required": True,
            "helpText": "In the case of a Fund, a letter from the General Partner confirming that no investor has a 25% beneficial ownership will suffice (if that is the case)",
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']}
        }
    ]
}

LIMITED_PARTNERSHIP_PERSONAL_CARD = {
    **deepcopy(PERSONAL_CARD),
    "kyc_investor_type": KYCInvestorType.LIMITED_PARTNERSHIP,
}

LIMITED_PARTNERSHIP_HOME_ADDRESS_CARD = {
    "kyc_investor_type": KYCInvestorType.LIMITED_PARTNERSHIP,
}

LIMITED_PARTNERSHIP_INDIVIDUAL_DOCUMENTS_CARD = {
    "kyc_investor_type": KYCInvestorType.LIMITED_PARTNERSHIP,
}
