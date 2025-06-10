from api.agreements.services.application_data.constants import TEXT_FIELD_TYPE, CHECKBOX_TYPE, SIGNATURE_TYPE

GLOBAL_ENTITY_SC = {
    "fields": [
        {
            'tab_label': 'LegalName',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'Countryof',
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
            'tab_label': 'NumberStreet_2',
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
            'tab_label': 'SpecifiedUSP_field',
            "conditional_parent_label": 'EntitySpecifiedUSP',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'EntityUSP_field',
            "conditional_parent_label": 'EntityUSP',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'GIIN',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'SponsoringEntityName',
            "conditional_parent_label": 'NoUSreportableAcc',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'SponsoringEntityGIIN',
            "conditional_parent_label": 'NoUSreportableAcc',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'EntitySpecifiedUSP',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'EntityUSP',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ReportingModel1FFI',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'RegisteredDemmedComp',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ReportingModel2FFI',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ParticipatingForeignFI',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'EntitySponsored',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'NoUSreportableAcc',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'OtherEntity',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SpecifyType',
            "conditional_parent_label": 'OtherEntity',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'JurTaxResidency1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'JurTaxResidency2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'JurTaxResidency3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxRefNumberType1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxRefNumberType2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxRefNumberType3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferNumber1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferNumber2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferNumber3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'SponsorBehalf',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SponsoringEntityName1',
            "conditional_parent_label": 'SponsorBehalf',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'SponsoringEntityName2',
            "conditional_parent_label": 'SponsorBehalf',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'SponsoringEntityName3',
            "conditional_parent_label": 'SponsorBehalf',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'Entityb',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'TrusteeName',
            "conditional_parent_label": 'Entityb',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'TrusteeGIIN',
            "conditional_parent_label": 'Entityb',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'Entityc',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'IndicateExemption',
            "conditional_parent_label": 'Entityc',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'Entityd',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'EntityExemptBO',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'IndicateStatusEntityExemptBO',
            "conditional_parent_label": 'EntityExemptBO',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'EntityActiveNFFE',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'IndicateQualifyingCriteria',
            "conditional_parent_label": 'EntityActiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'EntityDirectReportingNFFE',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'DirectReportingNFFEGIIN',
            "conditional_parent_label": 'EntityDirectReportingNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'EntitySponsoredDR',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'SponsoringEntityName1_1',
            "conditional_parent_label": 'EntitySponsoredDR',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'SponsoringEntityName1_2',
            "conditional_parent_label": 'EntitySponsoredDR',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'SponsoringEntityName1_3',
            "conditional_parent_label": 'EntitySponsoredDR',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'true'
        },
        {
            'tab_label': 'EntityPassiveNFFE',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'FullNameRow1',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameRow2',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameRow3',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullResidenceAddressRow1',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullResidenceAddressRow2',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullResidenceAddressRow3',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceTypeNumberRow1',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceTypeNumberRow2',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceTypeNumberRow3',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameAnyControlPersons1',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameAnyControlPersons2',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameAnyControlPersons3',
            "conditional_parent_label": 'EntityPassiveNFFE',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'JurisdictionsTaxResidency1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'JurisdictionsTaxResidency2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'JurisdictionsTaxResidency3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceNumberType1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceNumberType2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceNumberType3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceNumber1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceNumber2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TaxReferenceNumber3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'ReasonNonAvailability',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'EntityFinancialInstitution',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ReportingFinancialInst',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'NonReportingFinancialInst',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'GovernmentalEntity',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'International Organization',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'CentralBank',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'BroadPRetirementFund',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'NarrowPRetirementFund',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'PensionFGovernmentalEntity',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'ExemptCInvestmentV',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'TrustCRS',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'QualifiedCCIssuer',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'FinancialInstitutionNPJ',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'InvestmentEntity',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'InvestmentEntityOther',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'WidelyHeld',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'PensionFund',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'FullNameControllingP1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP4',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP5',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP6',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP7',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP8',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP9',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP10',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'OtherInvestmentEntity',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'OtherFinancialInstitution',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'EntityActiveNonFE',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Entity52a',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'StockExchangeName',
            "conditional_parent_label": 'Entity52a',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'TradedCorporation',
            "conditional_parent_label": 'Entity52a',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Entity52b',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Entity52c',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'OtherActiveNonFinancialEntity',
            "conditional_parent_label": 'Entity52c',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Entity53',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'FullNameControllingP53_1',
            "conditional_parent_label": 'Entity53',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP53_2',
            "conditional_parent_label": 'Entity53',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FullNameControllingP53_3',
            "conditional_parent_label": 'Entity53',
            "conditional_parent_value": 'on',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'AuthorisedSignature',
            'optional': 'false',
            'type': SIGNATURE_TYPE
        },
        {
            'tab_label': 'date_af_date',
            'optional': 'false',
            'type': TEXT_FIELD_TYPE,
            'validation_pattern': '^((|0)[1-9]|[1-2][0-9]|3[0-1])/((|0)[1-9]|1[0-2])/[0-9]{4}$',
            'validation_message': 'Date should follow this format: dd/mm/yyyy'
        },
        {
            'tab_label': 'PositionTitle',
            'type': TEXT_FIELD_TYPE,
            'retain_style': True,
            'required': 'true'
        },
        {
            'tab_label': 'AuthorisedSignature_2',
            "conditional_parent_label": 'PositionTitle_2',
            "conditional_parent_value": '##ANY##',
            'optional': 'false',
            'type': SIGNATURE_TYPE
        },
        {
            'tab_label': 'date_2_af_date',
            'optional': 'true',
            'type': TEXT_FIELD_TYPE,
            'validation_pattern': '^((|0)[1-9]|[1-2][0-9]|3[0-1])/((|0)[1-9]|1[0-2])/[0-9]{4}$',
            'validation_message': 'Date should follow this format: dd/mm/yyyy'
        },
        {
            'tab_label': 'PositionTitle_2',
            'type': TEXT_FIELD_TYPE,
            'retain_style': True,
            'required': 'false'
        },
        {
            'tab_label': 'FamilyNameorSurname',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'FirstGivenName',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'MiddleName',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Line1ResidenceAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Line2TownCity',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CurrentRACountry',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CurrentRAPC',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Line1MailingAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Line2MailingAddress',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'MailingAddressCountry',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'MailingAddressPC',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'DateBirth_af_date',
            'type': TEXT_FIELD_TYPE,
            'required': 'false',
            'validation_pattern': '^((|0)[1-9]|[1-2][0-9]|3[0-1])/((|0)[1-9]|1[0-2])/[0-9]{4}$',
            'validation_message': 'Date of birth should follow this format: dd/mm/yyyy'
        },
        {
            'tab_label': 'PlaceBirth',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'CountryBirth',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'LegalNameEntity1',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'LegalNameEntity2',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'LegalNameEntity3',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
        {
            'tab_label': 'Section8-a-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-a-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-a-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-b-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-b-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-b-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-c-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-c-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-c-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-d-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-d-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-d-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-e-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-e-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-e-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-f-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-f-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-f-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-g-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-g-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-g-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-h-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-h-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-h-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-i-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-i-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-i-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-k-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-k-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-k-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-j-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-j-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-j-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-m-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-m-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-m-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-n-1',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-n-2',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Section8-n-3',
            'type': CHECKBOX_TYPE,
        },
        {
            'tab_label': 'Signature14',
            'optional': 'false',
            'type': SIGNATURE_TYPE
        },
        {
            'tab_label': 'date_3_af_date',
            'optional': 'false',
            'type': TEXT_FIELD_TYPE,
            'validation_pattern': '^((|0)[1-9]|[1-2][0-9]|3[0-1])/((|0)[1-9]|1[0-2])/[0-9]{4}$',
            'validation_message': 'Date should follow this format: dd/mm/yyyy'
        },
        {
            'tab_label': 'PrintName',
            'type': TEXT_FIELD_TYPE,
            'retain_style': True,
            'required': 'true'
        },
        {
            'tab_label': 'Capacity',
            'type': TEXT_FIELD_TYPE,
            'required': 'false'
        },
    ],
    "groups": []
}