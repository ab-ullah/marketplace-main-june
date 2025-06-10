from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, CHECKBOX_TYPE, SIGNATURE_TYPE, DATE_TYPE

GLOBAL_INDIVIDUAL_SC = {
        "fields": [
            {
                'tab_label': 'AccountHolderName',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'dob_af_date',
                'type': TEXT_FIELD_TYPE,
                'retain_style': True,
                'height': '19px',
                'required': 'true',
                'validation_pattern': '^((|0)[1-9]|[1-2][0-9]|3[0-1])/((|0)[1-9]|1[0-2])/[0-9]{4}$',
                'validation_message': 'Date of birth should follow this format: dd/mm/yyyy'
            },
            {
                'tab_label': 'PlaceCountryBirth',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'NumberStreet',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'CityTown',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'StateProvinceCounty',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'PostCode',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'Country',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'Number Street_2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'CityTown_2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'StateProvinceCounty_2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'PostCode_2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'Country_2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'toggle_1',
                'tab_group_labels': ['declaration_of_citizenship'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'ssn',
                "conditional_parent_label": 'toggle_1',
                "conditional_parent_value": 'on',
                'type': TEXT_FIELD_TYPE,
                'required': 'true'
            },
            {
                'tab_label': 'toggle_2',
                'tab_group_labels': ['declaration_of_citizenship'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'toggle_3',
                'tab_group_labels': ['declaration_of_citizenship'],
                'type': CHECKBOX_TYPE
            },
            {
                'tab_label': 'Countrycountries_of_tax_residencyRow1',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'Countrycountries_of_tax_residencyRow2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'Countrycountries_of_tax_residencyRow3',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,

            },
            {
                'tab_label': 'Tax_reference_number_typeRow1',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'Tax_reference_number_typeRow2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'Tax_reference_number_typeRow3',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'Tax_reference_numberRow1',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'Tax_reference_numberRow2',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'Tax_reference_numberRow3',
                'type': TEXT_FIELD_TYPE,
                'required': 'false',
                'disable_auto_size': 'false',
                'height': '25',
                'retain_style': True,
            },
            {
                'tab_label': 'NotApplicableJurisdiction',
                'type': TEXT_FIELD_TYPE,
                'required': 'false'
            },
            {
                'tab_label': 'Signature1',
                'optional': 'false',
                'type': SIGNATURE_TYPE
            },
            {
                'tab_label': 'data_of_signing_af_date',
                'required': 'true',
                'type': TEXT_FIELD_TYPE,
                'validation_pattern': '^((|0)[1-9]|[1-2][0-9]|3[0-1])/((|0)[1-9]|1[0-2])/[0-9]{4}$',
                'validation_message': 'Date should follow this format: dd/mm/yyyy'
            }
        ],
        "groups": [
            {
                "document_id": "1",
                "group_label": 'declaration_of_citizenship',
                "maximum_allowed": "1",
                "minimum_required": "1",
                "group_rule": 'SelectAtLeast',
                "page_number": "1"
            }
        ]
    }