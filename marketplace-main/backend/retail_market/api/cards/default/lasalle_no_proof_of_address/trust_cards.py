from copy import deepcopy

from api.cards.default.individual_cards import PERSONAL_CARD
from api.constants.id_documents import IdDocuments
from api.kyc_records.models import KYCInvestorType



TRUST_PARTICIPANT_INFO_CARD = {
    "card_id": "aml-kyc-trust-participant-information",
    "order": 5,
    "name": "Participant information",
    "kyc_investor_type": KYCInvestorType.PARTICIPANT,
    "is_repeatable": True,
    "schema": [
        {
            "id": 'proof_of_identity-section',
            "type": 'section_header',
            "label": 'Please provide the following information for at least two entity directors and ALL shareholders that own 25% or more of the shares in the company.',
            "data": {
                "size": 'medium',
            }
        },
        {
            "id": "first_name",
            "label": "First name",
            "type": "text",
            "required": True,
            "data": {
                "placeholder": "First name"
            }
        },
        {
            "id": "last_name",
            "label": "Last name",
            "type": "text",
            "required": True,
            "data": {
                "placeholder": "Last name"
            }
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
            "id": 'proof_of_identity-proof-of-identity-note',
            "type": 'section_header',
            "label": 'Proof of identity',
            "data": {
                "size": 'large',
            }
        },
        {
            'id': 'id_issuing_country', 'label': 'Issuing Country', 'type': 'select-country',
            'required': True,
            "data": {}
        },
        {
            "id": "id_expiration_date",
            "type": "date",
            "label": "ID Expiration",
            'required': True,
            "data": {
                "afterToday": True,
            },
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
            "data": {
                "file_types": [
                    "image/*", "application/pdf"
                ]
            },
            "type": "file_upload",
            "label": "ID Document Image",
            "required": True
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

TRUST_INFO_CARD = {
    "card_id": "aml-kyc-private-company-participant-information",
    "order": 4,
    "name": "Trust",
    "kyc_investor_type": KYCInvestorType.TRUST,
    "is_repeatable": False,
    "schema": [
        {
            "id": "entity_name",
            "label": "What is the name of your entity?",
            "type": "text",
            "required": False,
            "data": {

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
    ]
}

TRUST_DOCUMENTS_CARD = {
    "card_id": 'aml-kyc-trust-documents',
    "name": 'Trust Documents',
    "kyc_investor_type": KYCInvestorType.TRUST,
    "order": 6,
    "schema": [
        {
            "id": "trust_documents_section",
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
            "id": 'trust_deeds_or_agreements',
            "label": 'Trust deed or agreement (or equivalent constitutional document)',
            "type": 'file_upload',
            "required": True,
            "data": {"file_types": ['image/*', 'application/pdf']},
            "helpText": 'Please upload trust deed or agreement (or equivalent constitutional document)'
        },
        {
            "id": 'trust_applicable_resolutions_powers_of_attorney_or_authorization letters',
            "label": "Any applicable resolutions, powers of attorney or authorisation letters authorizing the investor’s investment",
            "type": 'file_upload',
            "required": False,
            "helpText": "Please upload Any applicable resolutions, powers of attorney or authorization letters authorizing the investor’s investment",
            "data": {"file_types": ['image/*', 'application/pdf', 'application/msword']},
        }
    ]
}

TRUST_PERSONAL_CARD = {
    **deepcopy(PERSONAL_CARD),
    "kyc_investor_type": KYCInvestorType.TRUST,
}

TRUST_HOME_ADDRESS_CARD = {
    "kyc_investor_type": KYCInvestorType.TRUST,
}

TRUST_INDIVIDUAL_DOCUMENTS_CARD = {
    "kyc_investor_type": KYCInvestorType.TRUST,
}
