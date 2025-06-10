from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, CHECKBOX_TYPE, SIGNATURE_TYPE, DATE_TYPE

W_8IMY = {
    "fields": [
        {
            'tab_label': 'NameOrganization',
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
            'tab_label': 'QI',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Nonqualified',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'TerritoryFinancialInst',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'WithholdingFP',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'USbranch',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'WithholdingFT',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonWithholdingFP',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonWithholdingFT',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonWithholdingGT',
            'tab_group_labels': ['chapter-3-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonparticipatingFFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ParticipatingFFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'RegisteredDeemedCFFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'TerritoryFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'SponsoredFFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedNonRegistlocalBank',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedlowvalueAccounts',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedCompliantSponsored',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedCompliantLimitedLife',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertainInvestments',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'OwnerDocumentedFFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExemptRetirementPlans',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'RestrictedDistributor',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ForeignCentralBank',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonReportingIGA',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'PubliclyTradedNFFE',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExceptedTerritoryNFFE',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ActiveNFFE',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'PassiveNFFE',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'DirectReportingNFFE',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExemptNonfinancialGroupEntity',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExemptNonfinancialStartUpCompany',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExemptNonfinancialEntityLiquidation',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'SponsoredDirectReportingNFFE',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ReportingModel1FFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ReportingModel2FFI',
            'tab_group_labels': ['chapter-4-status'],
            'type': CHECKBOX_TYPE
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
            'tab_label': 'PermanentCountry',
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
            'required': 'false'
        },
        {
            'tab_label': 'QI-EIN',
            'tab_group_labels': ['taxpayer-id-number'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'WP-EIN',
            'tab_group_labels': ['taxpayer-id-number'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'WT-EIN',
            'tab_group_labels': ['taxpayer-id-number'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'EIN',
            'tab_group_labels': ['taxpayer-id-number'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'GIIN',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'ReferenceNumbers',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'BranchnonPFFI',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ParticipatingFFIchapter4',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ReportingModel1',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ReportingModel2',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'USBranch',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'AddressOfBranch',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CityTownBranch',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'BranchCountry',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'BranchGIIN',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CertifyEntityPart14',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certify15a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certifyb',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certifyc',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certifyd',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certifye',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certifyf',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certifyg',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '16a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '16b-1',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '16b-2',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '16b-3',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '17a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '17b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '17c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '17d',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '18a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '18b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '18c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '19a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '19b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '19c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '20',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '21a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '21b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '22',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'SponsoredFFIPartX',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': '23b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '23c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '24a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '24b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '24c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '25',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '25b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '25c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '26',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'SponsoringEntityPartXIV',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': '27b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '28',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '29',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '30a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '30b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '30c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '31',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '32',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Requirements32',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Treated',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TrusteeName',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'USTrustee',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ForeignTrustee',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '32b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '32c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '33a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '33b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '33c',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '33d',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '33e',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '33f',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '34',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '35',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'PartXXIIdate',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': '36',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'PartXXIIIdate',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'StockCorporation',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'EntityName',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'SecuritiesName',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': '37a',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '37b',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '38',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '39',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '40',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Certify',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'SponsoringEntityNFFE',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Signature14',
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
    "groups": [
            {
                "document_id": "1",
                "group_label": 'chapter-3-status',
                "maximum_allowed": "1",
                "minimum_required": "1",
                "group_rule": 'SelectAtLeast',
                "page_number": "1"
            },
            {
                "document_id": "1",
                "group_label": 'chapter-4-status',
                "maximum_allowed": "1",
                "minimum_required": "1",
                "group_rule": 'SelectAtLeast',
                "page_number": "1"
            },
            {
                "document_id": "1",
                "group_label": 'taxpayer-id-number',
                "maximum_allowed": "1",
                "minimum_required": "1",
                "group_rule": 'SelectAtLeast',
                "page_number": "3"
            },
    ]
}