from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, CHECKBOX_TYPE, SIGNATURE_TYPE, DATE_TYPE

W_9 = {
        "fields": [
            {
                'tab_label': 'tax-individual',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-partnership',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-c-corp',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-trust',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-s-corp',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-llc',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-other',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-other',
                'tab_group_labels': ['tax-certification-group'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'tax-foreign',
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'name',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'business-name',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'tax-payee-code',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'tax-fatca-exempt-code',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'tax-address',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'tax-address-2',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'tax-account-numbers',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'tax-ssn-3',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'tax-ssn-2',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'tax-ssn-4',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'tax-ein-2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'tax-ein-7',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'tax-requesters-name',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'llc-tax-classification',
                "conditional_parent_label": 'tax-llc',
                "conditional_parent_value": 'on',
                'type': TEXT_FIELD_TYPE
            },
            {
                'tab_label': 'other-documentation',
                "conditional_parent_label": 'tax-other',
                "conditional_parent_value": 'on',
                'type': TEXT_FIELD_TYPE
            },
            {
                'tab_label': 'eSignSignHere',
                'optional': 'false',
                'type': SIGNATURE_TYPE
            },
            {
                'tab_label': 'eSignDate_af_date',
                'optional': 'false',
                'type': DATE_TYPE
            }
        ],
        "groups": [
            {
                "document_id": "1",
                "group_label": 'tax-certification-group',
                "maximum_allowed": "1",
                "minimum_required": "1",
                "group_rule": 'SelectAtLeast',
                "page_number": "1"
            }
        ]
    }