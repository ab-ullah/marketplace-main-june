from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, CHECKBOX_TYPE, SIGNATURE_TYPE, DATE_TYPE

W_8ECI = {
    'fields': [
        {
            'tab_label': 'NameIndividual',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'CountryOfOrganization',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'NameofEntity',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Partnership',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'FG-CE',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'FG-IP',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'PrivateFoundation',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SimpleTrust',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'GrantorTrust',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'IntOrganization',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Individual',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ComplexTrust',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CentralBankOfIssue',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Corporation',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Estate',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Tax-exemptOrganization',
            'tab_group_labels': ['entity'],
            'type': CHECKBOX_TYPE,
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
            'tab_label': 'BusinessAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CityTownBusinessAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'SSN-ITIN',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'EIN',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ForeignTIN',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'ReferenceNumbers',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FTIN',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'eSignDate_dob_af_date',
            'type': DATE_TYPE,
            'required': 'true',
        },
        {
            'tab_label': 'EachItemIncome',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'CertifyDealer',
            'tab_group_labels': ['certify-dealer'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Certify',
            'tab_group_labels': ['certify'],
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Signature14',
            "conditional_parent_label": 'Certify',
            "conditional_parent_value": 'on',
            'optional': 'false',
            'type': SIGNATURE_TYPE
        },
        {
            'tab_label': 'eSignDate_af_date',
            'optional': 'false',
            'type': DATE_TYPE
        },
        {
            'tab_label': 'PrintName',
            'type': TEXT_FIELD_TYPE,
            'retain_style': True,
            'required': 'true'
        },
    ],
    'groups': [
        {
            "document_id": "1",
            "group_label": 'entity',
            "maximum_allowed": "1",
            "minimum_required": "1",
            "group_rule": 'SelectAtLeast',
            "page_number": "1"
        },
        {
            "document_id": "1",
            "group_label": 'certify',
            "maximum_allowed": "1",
            "minimum_required": "1",
            "group_rule": 'SelectAtLeast',
            "page_number": "1"
        },
        {
            "document_id": "1",
            "group_label": 'certify-dealer',
            "maximum_allowed": "1",
            "minimum_required": "1",
            "group_rule": 'SelectAtLeast',
            "page_number": "1"
        },
    ]
}