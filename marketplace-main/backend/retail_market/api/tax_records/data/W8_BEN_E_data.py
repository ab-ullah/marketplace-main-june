from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, CHECKBOX_TYPE, SIGNATURE_TYPE, DATE_TYPE

W8_BEN_E = {
    'fields': [
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
            'tab_label': 'SimpleTrust',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CentralBankOfIssue',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'GrantorTrust',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Tax-exemptOrganization',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'PrivateFoundation',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'DisregardedEntity',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Corporation',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ComplexTrust',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Estate',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'IntOrganization',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'Partnership',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'FG-CE',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'FG-IP',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'FG-IP',
            'tab_group_labels': ['entity-type'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'HybridYes',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'HybridNo',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'BenOwnerItems',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'BenOwnerItems',
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonparticipatingFFI',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ParticipatingFFI',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ReportingModel1FFI',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ReportingModel2FFI',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'RegisteredDeemedCFFI',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'SponsoredFFI',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedNonRegistlocalBank',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedlowvalueAccounts',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedCompliantSponsored',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertifiedCompliantLimitedLife',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'CertainInvestments',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'OwnerDocumentedFFI',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'RestrictedDistributor',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonReportingIGA',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ForeignGovernment',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'InternationalOrganization',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExemptRetirementPlans',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'EntityWhollyOwned',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'TerritoryFinancialInstitution',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExceptedTerritoryNFFE',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExceptedNonfinancialGEntity',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExceptedNonfinancialStartup',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExceptedNonfinancialELiq',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': '501cOrganization',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NonprofitOrganization',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'PubliclyTradedNFFE',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ActiveNFFE',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'PassiveNFFE',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'ExceptedInterAf',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'DirectReportingNFFE',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'SponsoredDirectRNFFE',
            'tab_group_labels': ['FATCA-status'],
            'type': CHECKBOX_TYPE
        },
        {
            'tab_label': 'NotFinancialAccount',
            'tab_group_labels': ['FATCA-status'],
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
            'required': 'false'
        },
        {
            'tab_label': 'GIIN',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'ForeignTIN',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FTIN',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ReferenceNumbers',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'BranchnonPFFI',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ParticipatingFFIchapter4',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ReportingModel1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ReportingModel2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'USBranch',
            'type': CHECKBOX_TYPE,
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
            'tab_label': 'BenOwnerCountry',
            "conditional_parent_label": 'BenOwner',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'BenOwner',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Government',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Tax-exemptPension',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Other-Tax-exempt',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'PubTradedCorp',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SubPubTradCorp',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SubPubTradComp',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CompanyOwnership',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SubPubTradCorp',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CompanyDerivative',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CompanyIncome',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'FavorableDiscretionary',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'NoLob',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'OtherClaim',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'OtherSpecify',
            "conditional_parent_label": 'OtherClaim',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
        },
        {
            'tab_label': 'BenOwnerTreatyBen',
            'type': CHECKBOX_TYPE,
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
            'tab_label': 'SponsoringEntity',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CertifyPart1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyPart1-a',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part5',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part6',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part7',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part8',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part9',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part10',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SponsoringEntityPart7',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CertifyFFI-part10-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part10-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part10-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part11',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part11-b',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part11-c',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part12',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'RequirementsPart12',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Model1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Model2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part12',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'TreatedAs',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TrusteeName',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TrusteeUS',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'TrusteeForeign',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part13',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part14',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part14-b',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part15',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part15-b',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part15-c',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part15-d',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part15-e',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part15-f',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part16',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part17',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part18',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part19',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part20',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'DateOfBoard',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'LiquidationPlan',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'DatePart21',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'StockCorporation',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'NameSecuritiesMarket',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CertifyFFI-part21',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part22',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part23',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part23-b',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part24',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part25',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part26',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part26-b',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part26-c',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SponsoringEntityPart28',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'StockEntity',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CertifyFFI-part27',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CertifyFFI-part28',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Part29-Name1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name4',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address4',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN4',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name5',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address5',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN5',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name6',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address6',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN6',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name7',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address7',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN7',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name8',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address8',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN8',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Name9',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-Address9',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Part29-TIN9',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Certify',
            'tab_group_labels': ['certify'],
            'type': CHECKBOX_TYPE,
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
            "group_label": 'entity-type',
            "maximum_allowed": "1",
            "minimum_required": "1",
            "group_rule": 'SelectAtLeast',
            "page_number": "1"
        },
        {
            "document_id": "1",
            "group_label": 'hybrid',
            "maximum_allowed": "1",
            "minimum_required": "1",
            "group_rule": 'SelectAtLeast',
            "page_number": "1"
        },
        {
            "document_id": "1",
            "group_label": 'FATCA-status',
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
        }
    ]
}
