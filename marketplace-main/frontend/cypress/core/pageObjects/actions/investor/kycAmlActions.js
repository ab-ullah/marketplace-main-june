import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'


const verifyKYCPersonalInformation = () => {

    pages.generalActions.verifyOnlyElementIsDisabledUsingLocator(elements.kycAmlElements.kycEmail)
    pages.generalActions.verifyInputValue(elements.kycAmlElements.kycDateofBirth, data.KYC_AML_Data.KYC_AML.kyc_date_of_birth)
    pages.generalActions.verifyInputValue(elements.kycAmlElements.kycPhoneNumber, data.KYC_AML_Data.KYC_AML.kyc_phone_number)
    pages.generalActions.verifyRadioButtonValue(elements.kycAmlElements.kycCurrentEmployee, data.KYC_AML_Data.KYC_AML.kyc_current_employee)
    pages.generalActions.verifyRadioButtonValue(elements.kycAmlElements.kycUSperson, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    pages.generalActions.verifyInputValue(elements.kycAmlElements.kycNetWorth, data.KYC_AML_Data.KYC_AML.kyc_net_worth)
    pages.generalActions.verifyElementsText(elements.kycAmlElements.kycCountryofCitizenship, data.KYC_AML_Data.KYC_AML.kyc_country_of_citizenship)
    pages.generalActions.verifyElementsText(elements.kycAmlElements.kycOfficeLocation, data.KYC_AML_Data.KYC_AML.kyc_office_location)
    pages.generalActions.verifyRadioButtonValue(elements.kycAmlElements.kycPoliticallyExposed, data.KYC_AML_Data.KYC_AML.kyc_politically_exposed)
    pages.generalActions.verifyRadioButtonValue(elements.kycAmlElements.kycSourceofFunds, data.KYC_AML_Data.KYC_AML.kyc_sourceof_funds)
    pages.generalActions.verifyRadioButtonValue(elements.kycAmlElements.kycEconomicBeneficiary, data.KYC_AML_Data.KYC_AML.kyc_economic_beneficiary)
    pages.generalActions.verifyRadioButtonValue(elements.kycAmlElements.kycpurposeofSubscription, data.KYC_AML_Data.KYC_AML.kyc_purpose_subscription)

}
const fillCEKYCPersonalInformation = () => {
    pages.generalActions.typeInInput(elements.kycAmlElements.kycDateofBirth, data.KYC_AML_Data.KYC_AML.kyc_date_of_birth)
    pages.generalActions.verifyOnlyElementIsDisabledUsingLocator(elements.kycAmlElements.kycEmail)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycPhoneNumber, data.KYC_AML_Data.KYC_AML.kyc_phone_number)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycCuurentEmployeeRadio, data.KYC_AML_Data.KYC_AML.kyc_current_employee)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycUSpersonRadio, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    //CE
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycWhollyOwnedRadio, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycDirectParentRadio, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycSpecificPurposeRadio, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycNetWorth, data.KYC_AML_Data.KYC_AML.kyc_net_worth)




    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycCountryofCitizenship, data.KYC_AML_Data.KYC_AML.kyc_country_of_citizenship)
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycOfficeLocationcop, data.KYC_AML_Data.KYC_AML.kyc_country_of_citizenship)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycPoliticallyExposedRadiocop, data.KYC_AML_Data.KYC_AML.kyc_politically_exposed)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycSourceofFundRadiocop, data.KYC_AML_Data.KYC_AML.kyc_sourceof_funds)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycEconomicBeneficiarycop, data.KYC_AML_Data.KYC_AML.kyc_economic_beneficiary)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycpurposeofSubscriptionRadio, data.KYC_AML_Data.KYC_AML.kyc_purpose_subscription)


}
const fillCEKYCPersonalInformationforAnIndividual = () => {
    pages.generalActions.typeInInput(elements.kycAmlElements.kycDateofBirth, data.KYC_AML_Data.KYC_AML.kyc_date_of_birth)
    pages.generalActions.verifyOnlyElementIsDisabledUsingLocator(elements.kycAmlElements.kycEmail)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycPhoneNumber, data.KYC_AML_Data.KYC_AML.kyc_phone_number)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycCuurentEmployeeRadioIN, data.KYC_AML_Data.KYC_AML.kyc_current_employee)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycUSpersonRadioIN, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    //CE
    //pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycWhollyOwnedRadio, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    //pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycDirectParentRadio, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    //pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycSpecificPurposeRadio, data.KYC_AML_Data.KYC_AML.kyc_US_person)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycNetWorth, data.KYC_AML_Data.KYC_AML.kyc_net_worth)
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycCountryofCitizenshipIn, data.KYC_AML_Data.KYC_AML.kyc_country_of_citizenship)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycPoliticallyExposedRadio, data.KYC_AML_Data.KYC_AML.kyc_politically_exposed)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycSourceofFundRadio, data.KYC_AML_Data.KYC_AML.kyc_sourceof_funds)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.kycEconomicBeneficiaryIN, data.KYC_AML_Data.KYC_AML.kyc_economic_beneficiary)
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.purposeofSubscriptionOther)
    pages.generalActions.waitForTime(4000)
    pages.generalActions.typeInInput(elements.kycAmlElements.fillInPurposeInput, data.KYC_AML_Data.KYC_AML.kyc_purpose_of_subscription)


}
const verifyKYCHeaderTitle = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.headerTitleText).should('be.visible')
}
const verifyKYCPersonalInformationLabels = () => {
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycDOBFieldsLabel, data.KYC_AML_Data.KYC_AML.kyc_dob_fields_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycEmailLabel, data.KYC_AML_Data.KYC_AML.kyc_email_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycPhoneNumberLabel, data.KYC_AML_Data.KYC_AML.kyc_phone_number_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycCurrentEmployeeLabel, data.KYC_AML_Data.KYC_AML.kyc_current_employee_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycUSPersonInvestingLabel, data.KYC_AML_Data.KYC_AML.kyc_USPerson_investing_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycNetWorthLabel, data.KYC_AML_Data.KYC_AML.kyc_net_worth_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycCountryofCitizenShipLabel, data.KYC_AML_Data.KYC_AML.kyc_country_of_citizen_ship_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycOfficeLocationLabel, data.KYC_AML_Data.KYC_AML.kyc_office_location_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycPloticallyExposedPersonLabel, data.KYC_AML_Data.KYC_AML.kyc_plotically_exposed_person_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycSourceofFundsLabel, data.KYC_AML_Data.KYC_AML.kyc_source_of_funds_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycEconomicsBeneficiaryLabel, data.KYC_AML_Data.KYC_AML.kyc_economics_beneficiary_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycPurposeofSubscriptionLabel, data.KYC_AML_Data.KYC_AML.kyc_purpose_of_subscription_label)

}
const kycNextButtonOnPersonalInformation = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.nextButton).click()
}
const kycNextButtonOnPersonalInformationCE = () => {
    pages.generalActions.clickButtonUsingLabel(elements.kycAmlElements.nextButton)

}
const kycNextPageRedirection = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.clickOnNextButton).click()
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.clickOnNextButton).click()
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.clickOnNextButton).click()
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.clickOnNextButton).click()
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.clickOnNextButton).click()
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.clickOnNextButton).click()
    cy.wait(10000)
}

const verifyNextButtonisDisabled = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.nextButton).should("not.be.enabled")

}
const kycNextPageRedirectionSingle = () => {

    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.clickOnNextButton).should("be.enabled").click()

}
const verifykycHeaderPersonalInformation = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.kycHeaderPersonalInformationLabel, data.KYC_AML_Data.KYC_AML.kyc_header_title)
}
const verifykycHeaderHomeAddress = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.kycHomeAddressLabel, data.KYC_AML_Data.KYC_AML.kyc_home_address_label)
}
const verifyKYCHomeAddress = () => {

    //Country
    pages.generalActions.verifyElementsText(elements.kycAmlElements.kycHomeAdrressCountry, data.KYC_AML_Data.KYC_AML.kyc_home_address_country)
    //Address
    pages.generalActions.verifyInputValue(elements.kycAmlElements.kycHomeAddressAddress, data.KYC_AML_Data.KYC_AML.kyc_home_address_address)
    //City
    pages.generalActions.verifyInputValue(elements.kycAmlElements.kycHomeAddressCity, data.KYC_AML_Data.KYC_AML.kyc_Home_address_city)
    //State
    pages.generalActions.verifyElementsText(elements.kycAmlElements.kycHomeAddressState, data.KYC_AML_Data.KYC_AML.kyc_home_address_state)
    //Zip
    pages.generalActions.verifyInputValue(elements.kycAmlElements.kycHomeAddressZip, data.KYC_AML_Data.KYC_AML.kyc_home_address_zip)


}
const inputKYCHomeAddress = () => {

    //Country
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycHomeAdrressCountry, data.KYC_AML_Data.KYC_AML.kyc_home_address_country)
    //Address
    pages.generalActions.typeInInput(elements.kycAmlElements.kycHomeAddressAddress, data.KYC_AML_Data.KYC_AML.kyc_home_address_address)
    //City
    pages.generalActions.typeInInput(elements.kycAmlElements.kycHomeAddressCity, data.KYC_AML_Data.KYC_AML.kyc_Home_address_city)
    //State
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycHomeAddressStateSelect, data.KYC_AML_Data.KYC_AML.kyc_home_address_state)
    //Zip
    pages.generalActions.typeInInput(elements.kycAmlElements.kycHomeAddressZip, data.KYC_AML_Data.KYC_AML.kyc_home_address_zip)


}
const inputKYCHomeAddressOtherUSA = () => {

    //Country
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycHomeAdrressCountry, data.KYC_AML_Data.KYC_AML.kyc_home_address_country_other)
    //Address
    pages.generalActions.typeInInput(elements.kycAmlElements.kycHomeAddressAddress, data.KYC_AML_Data.KYC_AML.kyc_home_address_address)
    //City
    pages.generalActions.typeInInput(elements.kycAmlElements.kycHomeAddressCity, data.KYC_AML_Data.KYC_AML.kyc_Home_address_city)
    //Region
    pages.generalActions.typeInInput(elements.kycAmlElements.kycRegion, data.KYC_AML_Data.KYC_AML.kyc_home_address_region)
    //Zip
    pages.generalActions.typeInInput(elements.kycAmlElements.kycPostalCode, data.KYC_AML_Data.KYC_AML.kyc_home_address_zip)


}
const verifyKYCHomeAddressLabels = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.headerTitleText).should('be.visible')
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycHomeAdrressCountryLabel, data.KYC_AML_Data.KYC_AML.kyc_Home_Adrress_Country_Label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycHomeAddressAddressLabel, data.KYC_AML_Data.KYC_AML.kyc_Home_Address_Address_Label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycHomeAddressCityLabel, data.KYC_AML_Data.KYC_AML.kyc_Home_Address_City_Label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycHomeAddressStateLabel, data.KYC_AML_Data.KYC_AML.kyc_Home_Address_State_Label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.kycAmlElements.kycHomeAddressZipLabel, data.KYC_AML_Data.KYC_AML.kyc_Home_Address_Zip_Label)

}


const fillCEKYCCorporateEntity = () => {
    pages.generalActions.typeInInput(elements.kycAmlElements.kycYourEntity, data.KYC_AML_Data.KYC_AML.kyc_your_entity)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycTitleofSigning, data.KYC_AML_Data.KYC_AML.kyc_title_of_signing)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycDateOfFormation, data.KYC_AML_Data.KYC_AML.kyc_date_of_formation)
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycJurisdiction, data.KYC_AML_Data.KYC_AML.kyc_jurisdiction)
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycJurisdictionState, data.KYC_AML_Data.KYC_AML.kyc_home_address_state)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycRegisteredAddress, data.KYC_AML_Data.KYC_AML.kyc_registered_address)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycName0fBusinesss, data.KYC_AML_Data.KYC_AML.kyc_name_0f_business)

}


const fillCEKYCParticipantInformation = () => {
    pages.generalActions.verifyElementsText(elements.kycAmlElements.kycParticipantInformationPageDesc, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_PageDesc)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycParticipantInformationFname, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Fname)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycParticipantInformationLname, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Lname)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycParticipantInformationOccupation, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Occupation)

    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycParticipantInformationIssuingCountry, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_IssuingCountry)
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycParticipantInformationIDDocument, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_idExpiratiion)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycParticipantInformationidExpiratiion, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_IDexpiration)
    pages.generalActions.typeInInput(elements.kycAmlElements.kycParticipantInformationIdentification, data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Identification)
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.kycParticipantInformationidDocumentImage).click()

    cy.get(elements.kycAmlElements.kycParticipantInformationidDocumentImageupload).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })
}

const fillCEKYCCorporateDocumnet = () => {

    cy.get(':nth-child(5) > .mt-2 > .col-md-8 > .sc-liAPKD').click()
    cy.wait(8000)
    cy.get(elements.kycAmlElements.kycCertificate).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })

    cy.get(':nth-child(6) > .mt-2 > .col-md-8 > .sc-liAPKD').click()
    cy.wait(8000)
    cy.get(elements.kycAmlElements.kycCurrentDirectors).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })

    cy.get(':nth-child(7) > .mt-2 > .col-md-8 > .sc-liAPKD').click()
    cy.wait(8000)
    cy.get(elements.kycAmlElements.kycAuthorizedSignatories).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })

    cy.get(':nth-child(8) > .mt-2 > .col-md-8 > .sc-liAPKD').click()
    cy.wait(8000)
    cy.get(elements.kycAmlElements.kycShareholders).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })

    cy.get(':nth-child(9) > .mt-2 > .col-md-8 > .sc-liAPKD').click()
    cy.wait(8000)
    cy.get(elements.kycAmlElements.kycMemorandum).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })

    cy.get(':nth-child(10) > .mt-2 > .col-md-8 > .sc-liAPKD').click()
    cy.wait(8000)
    cy.get(elements.kycAmlElements.kycPowersofAttorney).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })
    cy.wait(5000)

}



const kycCorporateDocumnetDelete = () => {
    cy.get(':nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > [color="#F42222"]').click({
        force: true
    })
    cy.get(':nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > [color="#F42222"]').click({
        force: true
    })
    cy.get(':nth-child(7) > .mt-2 > .col-md-8 > :nth-child(1) > [color="#F42222"]').click({
        force: true
    })
    cy.get(':nth-child(8) > .mt-2 > .col-md-8 > :nth-child(1) > [color="#F42222"]').click({
        force: true
    })
    cy.get(':nth-child(9) > .mt-2 > .col-md-8 > :nth-child(1) > [color="#F42222"]').click({
        force: true
    })
    cy.get(':nth-child(10) > .mt-2 > .col-md-8 > :nth-child(1) > [color="#F42222"]').click({
        force: true
    })

}

const kycProofDocumnetDelete = () => {

    cy.get(':nth-child(2) > [color="#F42222"]').click({
        multiple: true
    })

}

const entityNameInputTaxForm = () => {
    pages.generalActions.getElementUsingLabel(data.KYC_AML_Data.KYC_AML.kyc_certified_copies)
    pages.generalActions.typeInInput(elements.kycAmlElements.kyccEntityName, data.KYC_AML_Data.KYC_AML.kyc_corporate_documnet_entity_name)


}
const clickOnNextButtonHomeAddress = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.nextButtonHomeAddress).click()

}
const selectRiskValueRating = () => {
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.kycRiskValueRating, data.KYC_AML_Data.KYC_AML.kyc_risk_value_rating)

}
const clickToUploadFile = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.uploadDocumentID).click()

}
const UploadFileIDdocumentImage = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.uploadDocumentID).click()
    cy.get(elements.kycAmlElements.chooseFile).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })

}

const uploadFileIDdocumentImageCE = () => {

    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.uploadDocumentID)
    pages.generalActions.waitForTime(6000)
    cy.get(elements.kycAmlElements.uploadDocumentIDCE).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })


}
const uploadFileProofCE = () => {

    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.uploadDocumentIDCE2ndClick)
    pages.generalActions.waitForTime(8000)
    cy.get(elements.kycAmlElements.chooseFile).selectFile(Cypress.env("company_logo_path"), {
        action: 'drag-drop'
    })
    pages.generalActions.waitForTime(6000)

}


const verifyUploadDocumentForm = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.headerTitleText).should('be.visible')
    pages.generalActions.verifyElementsText(elements.kycAmlElements.issuingCountry, data.KYC_AML_Data.KYC_AML.kyc_issuing_country)
    pages.generalActions.verifyElementsText(elements.kycAmlElements.IDdocumentType, data.KYC_AML_Data.KYC_AML.kyc_id_document_type)
    pages.generalActions.verifyInputValue(elements.kycAmlElements.IDexpiration, data.KYC_AML_Data.KYC_AML.kyc_id_expiration)
    pages.generalActions.verifyElementsText(elements.kycAmlElements.proofofAddress, data.KYC_AML_Data.KYC_AML.kyc_proof_of_addres)
}
const inputUploadDocumentForm = () => {
    //pages.generalActions.getElementUsingLocator(elements.kycAmlElements.headerTitleText).should('be.visible')
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.issuingCountrySelect, data.KYC_AML_Data.KYC_AML.kyc_issuing_country)
    pages.generalActions.typeInDropdownInput(elements.kycAmlElements.IDdocumentTypeSelect, data.KYC_AML_Data.KYC_AML.kyc_id_document_type)
    pages.generalActions.typeInInput(elements.kycAmlElements.IDexpiration, data.KYC_AML_Data.KYC_AML.kyc_id_expiration)
    pages.generalActions.typeInInput(elements.kycAmlElements.IdentificationNumber, data.KYC_AML_Data.KYC_AML.kyc_identification_number)

}

const verifyKYCUploadDocumnet = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.filenameSpan).should('be.visible')
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.deleteFileIcon).should('be.visible')
}
const verifyBackButton = () => {
    pages.generalActions.getElementUsingLocator(elements.kycAmlElements.backButtonUploadFile).should('be.visible')

}
const clickOnNextStepButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.kycAmlElements.nextButton)

}
const ScrollBottom = () => {
    cy.scrollTo("bottom")
}
const reload = () => {
    cy.reload()
}
const kycAmlActions = {

    verifyKYCPersonalInformation,
    verifyKYCHeaderTitle,
    verifyKYCPersonalInformationLabels,
    kycNextButtonOnPersonalInformation,
    verifykycHeaderPersonalInformation,
    verifykycHeaderHomeAddress,
    verifyKYCHomeAddress,
    verifyKYCHomeAddressLabels,
    clickOnNextButtonHomeAddress,
    clickToUploadFile,
    UploadFileIDdocumentImage,
    verifyUploadDocumentForm,
    verifyKYCUploadDocumnet,
    verifyBackButton,
    fillCEKYCPersonalInformation,
    kycNextButtonOnPersonalInformationCE,
    inputKYCHomeAddress,
    inputUploadDocumentForm,
    kycProofDocumnetDelete,
    uploadFileIDdocumentImageCE,
    fillCEKYCCorporateEntity,
    fillCEKYCParticipantInformation,
    fillCEKYCCorporateDocumnet,
    kycCorporateDocumnetDelete,
    kycNextPageRedirection,
    uploadFileProofCE,
    selectRiskValueRating,
    kycNextPageRedirectionSingle,
    entityNameInputTaxForm,
    ScrollBottom,
    reload,
    clickOnNextStepButton,
    fillCEKYCPersonalInformationforAnIndividual,
    verifyNextButtonisDisabled,
    inputKYCHomeAddressOtherUSA

}

export default kycAmlActions