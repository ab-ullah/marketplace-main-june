from api.kyc_records.models import KYCInvestorType, JobBandChoices, DEPARTMENT
from api.constants.id_documents import IdDocuments

ID_DOC_IMAGE_FILE_TYPE = 'id_doc_image'


def get_options_from_model_choices(model_choices):
    options = []
    for choice in model_choices.choices:
        options.append({'value': choice[0], 'label': str(choice[1])})
    return options


US_PERSON_FIELDS = [
    {
        "id": "applicant_owned_by_another_entity",
        "label": "Is the applicant a wholly-owned or majority-owned subsidiary of another entity?",
        "type": "radio-select",
        "required": True,
        "data": {
            "options": [
                {"label": "Yes", "value": "t"},
                {"label": "No", "value": "f"}
            ]
        },
        "field_dependencies": [
            {
                "field": "is_us_citizen",
                "relation": "equals",
                "value": 't'
            }
        ]
    },
    {
        "id": "direct_parent_owned_by_another_entity",
        "label": "Is the direct parent of the applicant a wholly-owned or majority-owned subsidiary of another entity?",
        "type": "radio-select",
        "required": True,
        "data": {
            "options": [
                {"label": "Yes", "value": "t"},
                {"label": "No", "value": "f"}
            ]
        },
        "field_dependencies": [
            {
                "field": "is_us_citizen",
                "relation": "equals",
                "value": 't'
            }
        ]
    },
    {
        "id": "applicant_organized_for_specific_purpose_of_investing",
        "label": "Was the applicant organised for the specific purpose of investing in the Fund?",
        "type": "radio-select",
        "required": True,
        "data": {
            "options": [
                {"label": "Yes", "value": "t"},
                {"label": "No", "value": "f"}
            ]
        },
        "field_dependencies": [
            {
                "field": "is_us_citizen",
                "relation": "equals",
                "value": 't'
            }
        ]
    },
]

POST_NET_WORTH_ENTITY_FIELDS = [
    {
        "id": "entity_title",
        "label": "What is your title for signing on behalf of your entity?",
        "type": "text",
        "required": True,
        "data": {
            "placeholder": "Entity Title"
        }
    },
]

PERSONAL_CARD = {
    "card_id": "aml-kyc-individual-personal-information",
    "order": "1",
    "name": "Personal information",
    "kyc_investor_type": KYCInvestorType.INDIVIDUAL,
    "schema": [
        {
            "id": "date_of_birth",
            "label": "Date of birth",
            "type": "date",
            "required": True,
            "data": {}
        },
        {
            "id": "email",
            "label": "Email",
            "type": "text",
            "required": False,
            "disabled": True,
            "data": {
                "placeholder": "Email"
            }
        },
        {
            "id": "phone_number",
            "label": "Phone Number",
            "type": "text",
            "required": True,
            "disabled": False,
            "data": {
                "placeholder": "Phone Number"
            }
        },
        {
            "id": "is_lasalle_or_jll_employee",
            "label": "A current employee",
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
            "id": "is_us_citizen",
            "label": "U.S. Person or investing for the direct or indirect benefit of a U.S. Person",
            "type": "radio-select",
            "required": True,
            "data": {"options": [
                {"label": "I am/ We are", "value": "t"},
                {"label": "I am/ We are not", "value": "f"}
            ]}
        },
        {
            "id": "net_worth",
            "label": "Net Worth",
            "type": "text",
            "required": True,
            "data": {
                "notAllowed": ['0', 'zero']
            },
            "helpText": {
                'heading': '',
                'description': 'What is the approximate dollar amount of the applicant’s estimated net worth (excluding the value of the applicant’s principal residence and its furnishings, and automobiles) at the time of the proposed investment in the Fund? If the applicant is a natural person, net worth may be the applicant’s joint net worth with the applicant’s spouse. (Note: an estimate or amount within a range may be given. A statement that the applicant’s net worth is more than 10 times with respect to entities, and 20 times with respect to individuals, the amount of the investment is also acceptable. If you would prefer to address this question in a different way, please contact the Co-Investment Team).'
            },
        },
        {
            "id": "citizenship_country",
            "label": "Country of citizenship",
            "type": "select-country",
            "required": True,
            "data": {"options": []}
        },
        {
            "id": "pollitically_exposed_person",
            "label": "Are you a politically exposed person, close associate of a politically exposed person, or a family member of a politically exposed person?",
            "type": "radio-select",
            "helpText": {
                "heading": " ",
                "description": """ - A “politically exposed person” is defined under Cayman Islands law as (a) a person who is or has been entrusted with prominent public functions by a foreign country, for example a Head of State or of government, senior politician, senior government, judicial or military official, senior executive of a state owned corporation, and important political party official; (b) a person who is or has been entrusted domestically with prominent public functions, for example a Head of State or of government, senior politician, senior government, judicial or military official, senior executives of a state owned corporation and important political party official; and (c) a person who is or has been entrusted with a prominent function by an international organisation like a member of senior management, such as a director, a deputy director and a member of the board or equivalent functions.

- A “close associate” means any natural person who is known to hold the ownership or control of a legal instrument or person jointly with a politically exposed person, or who maintains some other kind of close business or personal relationship with a politically exposed person, or who holds the ownership or control of a legal instrument or person which is known to have been established to the benefit of a politically exposed person.

- A “family member” includes the spouse, parent, sibling or child of a politically exposed person.
                 """
            },
            "required": True,
            "data": {
                "options": [
                    {"label": "Yes", "value": "t"},
                    {"label": "No", "value": "f"}
                ]
            }
        },
        {
            "id": "source_of_funds",
            "label": "Source of funds",
            "type": "radio-select",
            "helpText": {
                "heading": "",
                "description": '"Source of funds" is defined as "the origin of the particular funds or assets (for example an immediate source from which property has derived e.g. from a bank account in the name of the applicant for business or a third party) that will be used for the purposes of the business relationship or transaction (e.g. the amount being invested, deposited or remitted)"'
            },
            "required": True,
            "data": {
                "options": [
                    {"label": "Income from salary", "value": "salary"},
                    {"label": "Savings", "value": "savings"},
                    {"label": "Gift or Inheritance", "value": "gift"},
                    {"label": "Proceeds of a sale", "value": "proceeds"},
                    {"label": "Other source", "value": "other"}
                ]
            }
        },
        {
            "id": "source_of_funds_other",
            "label": "Fill in the source of funds",
            "type": "text",
            "required": True,
            "data": {
                "multiline": True,
                "maxLength": 500,
            },
            "field_dependencies": [
                {
                    "field": "source_of_funds",
                    "relation": "equals",
                    "value": "other"
                }
            ]
        },
        {
            "id": "source_of_funds_sale",
            "label": "Fill in the details for sales proceeds",
            "type": "text",
            "required": True,
            "data": {
                "multiline": True,
                "maxLength": 500,
            },
            "field_dependencies": [
                {
                    "field": "source_of_funds",
                    "relation": "equals",
                    "value": "proceeds"
                }
            ]
        },
        {
            "id": "source_of_funds_profession",
            "label": "Profession",
            "type": "text",
            "required": True,
            "data": {
                "multiline": False,
                "maxLength": 200,
            },
            "field_dependencies": [
                {
                    "field": "source_of_funds",
                    "relation": "equals",
                    "value": "salary"
                }
            ]
        },
        {
            "id": "economic_beneficiary",
            "label": "Economic Beneficiary",
            "type": "radio-select",
            "required": True,
            "data": {
                "options": [
                    {
                        "label": "I am/We are investing on my/our own behalf and hereby confirm I am/we are the ultimate economic beneficiary/ies of the funds and any subsequent income invested.",
                        "value": "own_behalf"
                    },
                    {
                        "label": "I am/We are investing on behalf of a third party/ies who is/are the ultimate economic beneficiary/ies of the funds and any subsequent income invested and in case of more than one party, at least one is an employee.",
                        "value": "third_party"
                    }
                ]
            }
        },
        {
            "id": "purpose_of_the_subscription",
            "label": "Purpose of the subscription",
            "type": "radio-select",
            "required": True,
            "helpText": " ",
            "data": {
                "options": [
                    {"label": "To gain exposure to the Fund's investment strategy", "value": "exposure"},
                    {"label": "Other", "value": "other"}
                ]
            }
        },
        {
            "id": "purpose_of_the_subscription_other",
            "label": "Fill in the purpose of the subscription",
            "type": "text",
            "required": True,
            "data": {
                "multiline": True,
                "maxLength": 500,
            },
            "field_dependencies": [
                {
                    "field": "purpose_of_the_subscription",
                    "relation": "equals",
                    "value": "other"
                }
            ]
        }
    ]
}

HOME_ADDRESS_CARD = {
    "card_id": "aml-kyc-individual-home-address",
    "order": "2",
    "name": "Home address",
    "kyc_investor_type": KYCInvestorType.INDIVIDUAL,
    "schema": [
        {
            "id": "home_address",
            "data": {
                "placeholder": "Address"
            },
            "type": "text",
            "label": "Address",
            "required": True
        },
        {
            "id": "home_city",
            "data": {
                "placeholder": "City"
            },
            "type": "text",
            "label": "City",
            "required": True
        },
        {
            "id": "home_zip",
            "data": {
                "placeholder": "Zip"
            },
            "type": "text",
            "label": "Zip",
            "required": True,
            "field_dependencies": [
                {
                    "field": "home_country",
                    "value": "232",
                    "relation": "equals"
                }
            ]
        },
        {
            "id": "home_zip",
            "data": {
                "placeholder": "Postal code"
            },
            "type": "text",
            "label": "Postal code",
            "required": True,
            "field_dependencies": [
                {
                    "field": "home_country",
                    "value": ["232"],
                    "relation": "not_in"
                }
            ]
        }
    ]
}

DOCUMENTS_CARD = {
    "card_id": "aml-kyc-individual-upload-documents",
    "order": "3",
    "name": "Upload documents",
    "kyc_investor_type": KYCInvestorType.INDIVIDUAL,
    "schema": [
        {
            "id": "proof_of_identity_section",
            "type": "section_header",
            "label": "Proof of Identity",
            "data": {
                "size": "large"
            }
        },
        {
            "id": "identity_for_employees_section",
            "type": "section_header",
            "label": "",
            "data": {
                "size": "medium"
            },
            "field_dependencies": [
                {
                    "field": "is_lasalle_or_jll_employee",
                    "value": "t",
                    "relation": "not_equals"
                }
            ]
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
            "required": True,
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
        }
    ]
}
