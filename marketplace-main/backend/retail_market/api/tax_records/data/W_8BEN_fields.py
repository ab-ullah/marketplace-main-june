from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, CHECKBOX_TYPE, SIGNATURE_TYPE, DATE_TYPE

W_8BEN = {
    'fields': [
        {
            'tab_label': 'NameIndividual',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'CountryCitizenship',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'PermanentResidenceAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'CityorTown',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'Country',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'MailingAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CityTownMailingAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CountryMailingAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'UStaxpayerID',
            'type': TEXT_FIELD_TYPE,
            'required': 'false',
            'value': ''
        },
        {
            'tab_label': 'ForeignTaxID',
            "conditional_parent_label": 'UStaxpayerID',
            "conditional_parent_value": ' ',
            'type': TEXT_FIELD_TYPE,
            'required': 'true',
        },
        {
            'tab_label': 'FTIN',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ReferenceNumbers',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'eSignDate_dob_af_date',
            'type': DATE_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'BenOwnerCountry',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'BenOwnerProvisions',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'PercentageRate',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TypeIncome',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'AdditionalConditions',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Certify',
            'tab_group_labels': ['certify'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Signature14',
            'optional': 'false',
            'type': SIGNATURE_TYPE
        },
        {
            'tab_label': 'PrintNameSigner',
            'required': 'true',
            'type': TEXT_FIELD_TYPE
        },
        {
            'tab_label': 'PrintName',
            'type': TEXT_FIELD_TYPE,
            'retain_style': True,
            'required': 'true'
        },
        {
            'tab_label': 'eSignDate_af_date',
            'optional': 'false',
            'type': DATE_TYPE
        },
    ],
    'groups': [
        {
            "document_id": "1",
            "group_label": 'certify',
            "maximum_allowed": "1",
            "minimum_required": "1",
            "group_rule": 'SelectAtLeast',
            "page_number": "1"
        },
    ]
}