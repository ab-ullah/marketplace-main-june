import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'


const verifyHeaderSection = () => {
    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.titleHeader,
        labels.myApplicationOverviewLabels.titleHeaderLabel)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.submitChangeButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.withDrawApplicationButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.backtoDashboardButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.companyLogo)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.fundTitle)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.infotab)
}

const verifyApplicationTimelineStatus = () => {
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.firstStepEligibilityDecision)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.secondStepApplicationApproval)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.thirdStepKYC)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.forthStepTaxReview)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.fifthStepInternalTax)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.sixthStepLegalDocs)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.applicationStatusHeading)


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.continueYourApplication,
        labels.myApplicationOverviewLabels.continueYourApplicationButtonText)
}
const verifyApplicationTimelineStatusIN = () => {
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.firstStepEligibilityDecision)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.secondStepApplicationApproval)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.thirdStepKYC)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.forthStepTaxReview)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.fifthStepInternalTax)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.sixthStepLegalDocs)
    pages.generalActions.getElementUsingLabel(labels.myApplicationOverviewLabels.applicationStatusHeading)


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.continueYourApplication,
        labels.myApplicationOverviewLabels.continueYourApplicationButtonText)
}

const verifyInvestorInformation = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.investingDropdown,
        labels.myApplicationOverviewLabels.investingDropdownText)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.wheretoInvest,
        labels.myApplicationOverviewLabels.wheretoInvestText)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.firstNameOverview)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.lastNameOverview)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.jobtitleOverview)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.department,
        data.eligibilityData.createEligibility.department)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.jobBand,
        data.eligibilityData.createEligibility.job_band)

    pages.generalActions.verifyOnlyElementIsDisabledUsingLocator(elements.myApplicationOverviewElement.restrictedGeographicArea)
    pages.generalActions.verifyOnlyElementIsDisabledUsingLocator(elements.myApplicationOverviewElement.restrictedTimePeriod)
}
const verifyInvestorInformationIN = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.investingDropdown,
        labels.myApplicationOverviewLabels.investingDropdownTextIN)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.wheretoInvest,
        labels.myApplicationOverviewLabels.wheretoInvestText)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.firstNameOverview)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.lastNameOverview)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.jobtitleOverview)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.department,
        data.eligibilityData.createEligibility.department)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.jobBand,
        data.eligibilityData.createEligibility.job_band)

    pages.generalActions.verifyOnlyElementIsDisabledUsingLocator(elements.myApplicationOverviewElement.restrictedGeographicArea)
    pages.generalActions.verifyOnlyElementIsDisabledUsingLocator(elements.myApplicationOverviewElement.restrictedTimePeriod)
}
const verifyInvestmentInformation = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.investmentHeading,
        labels.myApplicationOverviewLabels.investmentHeading)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.finalizeEquity)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.howmuchLeverage1st)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.howmuchLeverage2nd)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.howmuchLeverage3rd)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.grossInvestmentEquity)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.grossInvestmentLeverage)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.finalizedGrossInvestment)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.finalizedGrossLeverage)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.finalizedLeverage1st)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.finalizedLeverage2nd)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.finalizedLeverage3rd)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.finalizedLeverage4th)


}
const verifyEligibilityCriteria = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.eligibilityCriteriaHeading,
        labels.myApplicationOverviewLabels.eligibilityCriteriaHeading)

    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.finalizeEquity)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.accreditedInvestorLabel)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.eligibilityDescription)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.uploadCreditReportText)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.uploadFile)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.fileSpan)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.knowledgeableQuestion)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.knowledgeableDescription)

}
const verifyEligibilityCriteriacop = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.eligibilityCriteriaHeading,
        labels.myApplicationOverviewLabels.eligibilityCriteriaHeading)

    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.finalizeEquity)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.accreditedInvestorLabel)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.eligibilityDescription)
    //pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.uploadCreditReportText)
    //pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.uploadFile)
    //pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.fileSpan)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.knowledgeableQuestion)
    pages.generalActions.verifyOnlyElementNotEnabledUsingLocator(elements.myApplicationOverviewElement.knowledgeableDescription)

}
const verifyPeronalInformation = () => {

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.personalInformationHeading,
        labels.myApplicationOverviewLabels.personalInformationHeading)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.kycHyperlink,
        labels.myApplicationOverviewLabels.kycHyperlinkLabel)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.DOB)

    pages.generalActions.VerifyNotCheckedUsingLocator(elements.myApplicationOverviewElement.emailAddress)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.currentEmployee,
        data.KYC_AML_Data.KYC_AML.kyc_current_employee)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.USperson,
        data.KYC_AML_Data.KYC_AML.kyc_US_person)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.whollyOwned,
        data.KYC_AML_Data.KYC_AML.kyc_current_employee)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.directParent,
        data.KYC_AML_Data.KYC_AML.kyc_current_employee)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.specificPurpose,
        data.KYC_AML_Data.KYC_AML.kyc_current_employee)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.netWorth)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.politicalExposed,
        data.KYC_AML_Data.KYC_AML.kyc_current_employee)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.sourcesofFund,
        data.KYC_AML_Data.KYC_AML.kyc_sourceof_funds)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.economicBeneficiary,
        data.KYC_AML_Data.KYC_AML.kyc_economic_beneficiary)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.purposeofsubscription,
        data.KYC_AML_Data.KYC_AML.kyc_purpose_subscription)


}
const verifyPeronalInformationIN = () => {

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.personalInformationHeading,
        labels.myApplicationOverviewLabels.personalInformationHeading)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.kycHyperlink,
        labels.myApplicationOverviewLabels.kycHyperlinkLabel)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.DOB)

    pages.generalActions.VerifyNotCheckedUsingLocator(elements.myApplicationOverviewElement.emailAddress)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.currentEmployee,
        data.KYC_AML_Data.KYC_AML.kyc_current_employee)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.USperson,
        data.KYC_AML_Data.KYC_AML.kyc_US_person)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.netWorth)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.politicalExposedIn,
        data.KYC_AML_Data.KYC_AML.kyc_current_employee_IN)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.sourcesofFundIN,
        data.KYC_AML_Data.KYC_AML.kyc_sourceof_funds)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.economicBeneficiaryIN,
        data.KYC_AML_Data.KYC_AML.kyc_economic_beneficiary)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.purposeofsubscription,
        data.KYC_AML_Data.KYC_AML.kyc_purpose_subscription_IN)


}
const verifyHomeAddress = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.homeAddressHeading,
        labels.myApplicationOverviewLabels.homeadressHeading)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.homeAddressCountry, data.KYC_AML_Data.KYC_AML.kyc_home_address_country)
    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.homeAddress, data.KYC_AML_Data.KYC_AML.kyc_home_address_address)
    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.homeAddressCity, data.KYC_AML_Data.KYC_AML.kyc_Home_address_city)
    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.homeAddressState, data.KYC_AML_Data.KYC_AML.kyc_home_address_state)
    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.homeAddressZip, data.KYC_AML_Data.KYC_AML.kyc_home_address_zip)

}
const verifyUploadDocument = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.uploadDocumentsHeading,
        labels.myApplicationOverviewLabels.uploadDocumentHeading)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.issuingCountry,
        data.KYC_AML_Data.KYC_AML.kyc_issuing_country)
    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.IDdocumentType,
        data.KYC_AML_Data.KYC_AML.kyc_id_document_type)
    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.IDexpiration,
        data.KYC_AML_Data.KYC_AML.kyc_id_expiration)
    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.identificationNumber,
        data.KYC_AML_Data.KYC_AML.kyc_identification_number)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.IDdocumentfile)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.IDdocumentUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.deleteIcon)
    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.proofofAddressDescription,
        data.KYC_AML_Data.KYC_AML.kyc_proof_of_addres)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.proofofAddressfile)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.proofofAddressUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.deleteIcon2nd)

}
const verifyCorporateEntity = () => {


    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.corporateEntityHeading,
        labels.myApplicationOverviewLabels.corporateEntityHeading)


    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.nameofEntity,
        data.KYC_AML_Data.KYC_AML.kyc_your_entity)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.titleSigning,
        data.KYC_AML_Data.KYC_AML.kyc_title_of_signing)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.dateofFormation,
        data.KYC_AML_Data.KYC_AML.kyc_date_of_formation)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.Jurisdiction,
        data.KYC_AML_Data.KYC_AML.kyc_jurisdiction)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.state,
        data.KYC_AML_Data.KYC_AML.kyc_jurisdiction_state)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.registedredAddress,
        data.KYC_AML_Data.KYC_AML.kyc_registered_address)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.natureofBusiness,
        data.KYC_AML_Data.KYC_AML.kyc_name_0f_business)

}
const verifyCorporateDocuments = () => {

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.corporateDocuments,
        labels.myApplicationOverviewLabels.corporateDocumentHeading)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.entityName,
        data.KYC_AML_Data.KYC_AML.kyc_your_entity)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.certificateLabel,
        labels.myApplicationOverviewLabels.cerificateFieldLabel)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.certificateUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.certificateDeleteIcon)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.currentDirectorLabel,
        labels.myApplicationOverviewLabels.directorFieldLabel)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.currentDirectorUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.currentDirectorDeleteIcon)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.signatoriesLabel,
        labels.myApplicationOverviewLabels.signatoriesFieldLabel)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.signatoriesUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.signatoriesDeleteIcon)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.shareholderLabel,
        labels.myApplicationOverviewLabels.shareholderFieldLabel)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.shareholderUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.shareholderDeleteIcon)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.memorandumLabel,
        labels.myApplicationOverviewLabels.memorandumFieldLabel)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.memorandumUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.memorandumDeleteIcon)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.resolutionLabel,
        labels.myApplicationOverviewLabels.resolutionFieldLabel)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.resolutionUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.resolutionDeleteIcon)


}
const verifyParticipantsInformation = () => {

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.accordHeader,
        labels.myApplicationOverviewLabels.accordHeaderLable)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.firstName,
        data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Fname)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.lastName,
        data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Lname)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.occupation,
        data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Occupation)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.issuingCountryParticipantInfo)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.IDdocumenttype,
        data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_idExpiratiion)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.participantIDexpiration,
        data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_IDexpiration)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.identificationNumner,
        data.KYC_AML_Data.KYC_AML.kyc_ParticipantInformation_Identification)

    pages.generalActions.VerifyCheckedUsingLocator(elements.myApplicationOverviewElement.onlyOneDirectorCheckBox)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.participantFile)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.partcipantUploadButton)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.participantDeleteIcon)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.sourceOfWealth)

}
const verifyTaxDetails = () => {

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.taxDetailsHeading,
        labels.myApplicationOverviewLabels.taxDetailsHeadingLabel)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.country,
        data.my_Tax_Form_Data.myTax.country_input)

    pages.generalActions.clickandVerifyTextUsingLocator(elements.myApplicationOverviewElement.USholder,
        data.my_Tax_Form_Data.myTax.us_holder)

    pages.generalActions.clickandVerifyTextUsingLocator(elements.myApplicationOverviewElement.taxExempt,
        data.my_Tax_Form_Data.myTax.tax_exampt_under_section)

    pages.generalActions.clickandVerifyTextUsingLocator(elements.myApplicationOverviewElement.partnership,
        data.my_Tax_Form_Data.myTax.exempt_of_taxtation)

    pages.generalActions.clickandVerifyTextUsingLocator(elements.myApplicationOverviewElement.exemptofTaxation,
        data.my_Tax_Form_Data.myTax.exempt_of_taxtation)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.taxPayerIdentificationNumber,
        data.my_Tax_Form_Data.myTax.tax_payer_identification)
}
const verifyTaxDetailsIN = () => {

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.taxDetailsHeading,
        labels.myApplicationOverviewLabels.taxDetailsHeadingLabel)

    pages.generalActions.verifyFieldValue(elements.myApplicationOverviewElement.country,
        data.my_Tax_Form_Data.myTax.country_input)

    pages.generalActions.clickandVerifyTextUsingLocator(elements.myApplicationOverviewElement.USholder,
        data.my_Tax_Form_Data.myTax.us_holder)

    pages.generalActions.clickandVerifyTextUsingLocator(elements.myApplicationOverviewElement.taxExempt,
        data.my_Tax_Form_Data.myTax.tax_exampt_under_section)

    pages.generalActions.clickandVerifyTextUsingLocator(elements.myApplicationOverviewElement.partnership,
        data.my_Tax_Form_Data.myTax.exempt_of_taxtation)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.taxPayerIdentificationNumber,
        data.my_Tax_Form_Data.myTax.tax_payer_identification)
}
const verifyTaxForms = () => {

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.taxFormHeading,
        labels.myApplicationOverviewLabels.taxFormsHeading)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.firstFormName)
    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.firstFormFile)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.firstFormDelete)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.firstFormStatus,
        labels.myApplicationOverviewLabels.formStatus)

    //pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.secondFormName)

    //pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.secondFormFile)

    //pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.secondFormDelete)

    //pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.secondFormStatus,
    //    labels.myApplicationOverviewLabels.formStatus)

    //pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.thirdFormName)

    //pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.thirdFormFile)

    //pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.thirdFormDelete)

    //pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.thirdFormStatus,
    //    labels.myApplicationOverviewLabels.formStatus)


}
const verifyBankingDetails = () => {

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.bankingDetailsHeading,
        labels.myApplicationOverviewLabels.bankingDetailsHeadingLabel)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.bankLocated,
        data.my_Bank_Detail_Data.myBankData.bank_located)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.bankName,
        data.my_Bank_Detail_Data.myBankData.bank_name)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.swiftCode,
        data.my_Bank_Detail_Data.myBankData.bank_sift)

    pages.generalActions.VerifyCheckedUsingLocator(elements.myApplicationOverviewElement.intermediaryCheckBox)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.intermediaryBankName,
        data.my_Bank_Detail_Data.myBankData.bank_intermediary_name)


    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.intermediarySwiftCode,
        data.my_Bank_Detail_Data.myBankData.bank_intermediary_swift_code)


    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.streetAddress,
        data.my_Bank_Detail_Data.myBankData.bank_streetAddress)


    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.city,
        data.my_Bank_Detail_Data.myBankData.bank_city)


    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.province,
        data.my_Bank_Detail_Data.myBankData.bank_province)


    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.postalCode,
        data.my_Bank_Detail_Data.myBankData.bank_postalCode)


    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.accountName,
        data.my_Bank_Detail_Data.myBankData.bank_accountName)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.accountNumber,
        data.my_Bank_Detail_Data.myBankData.bank_accountNumber)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.ibanNumber,
        data.my_Bank_Detail_Data.myBankData.bank_ibanNumber)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.creditAccountName,
        data.my_Bank_Detail_Data.myBankData.bank_creditAccountName)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.creditAccountNumber,
        data.my_Bank_Detail_Data.myBankData.bank_creditAccountNumber)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.currency,
        data.my_Bank_Detail_Data.myBankData.bank_currency)

    pages.generalActions.verifyElementValue(elements.myApplicationOverviewElement.reference,
        data.my_Bank_Detail_Data.myBankData.bank_reference)


}
const verifyDocuments = () => {

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.documentHeading,
        labels.myApplicationOverviewLabels.documentHeading)

    //pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.gotoDocumentLink)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.downloadicon)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.documentCheckBox)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.documentFile)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.documentEyeIcon)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.modalHeading)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.modalDownloadButton)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.modalCloseButton)

}
const verifyProgramDocuments = () => {

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.programDocumentHeading,
        labels.myApplicationOverviewLabels.programDocumentHeading)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.powerofAttorney)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.programeDocumentDownloadIcon)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.programDocumentFile)

    pages.generalActions.verifyElementsText(elements.myApplicationOverviewElement.agreement, "I ObjectI Agree")

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.programeDocumentEyeIcon)

    pages.generalActions.verifyElementOnPage(elements.myApplicationOverviewElement.programDocumentModalHeading)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.programDocumentPopUpDownloadButton)

    pages.generalActions.clickButtonUsingLocator(elements.myApplicationOverviewElement.programDocumentCloseButton)
}


const myApplicationOverviewActions = {
    verifyHeaderSection,
    verifyApplicationTimelineStatus,
    verifyInvestorInformation,
    verifyInvestmentInformation,
    verifyEligibilityCriteria,
    verifyHomeAddress,
    verifyUploadDocument,
    verifyCorporateEntity,
    verifyCorporateDocuments,
    verifyParticipantsInformation,
    verifyTaxDetails,
    verifyTaxForms,
    verifyBankingDetails,
    verifyDocuments,
    verifyProgramDocuments,
    verifyPeronalInformation,
    verifyEligibilityCriteriacop,
    verifyInvestorInformationIN,
    verifyApplicationTimelineStatusIN,
    verifyPeronalInformationIN,
    verifyTaxDetailsIN




}

export default myApplicationOverviewActions