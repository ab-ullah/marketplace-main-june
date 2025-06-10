import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'
import successAlerts from '../../../rules/successAlerts'
import failureAlerts from '../../../rules/failureAlerts'

const equityAmount = data.fundData.createFund.currency + ' ' + data.fundData.createFund.minimum_equity_investment
const zeroLeverageAmount = data.fundData.createFund.currency + ' ' + data.investorFundData.createInvestorFund.no_lvg
const oneThirdLeverageAmount = data.fundData.createFund.currency + ' ' + data.investorFundData.createInvestorFund.three_ratio_lvg
const oneFourthLeverageAmount = data.fundData.createFund.currency + ' ' + data.investorFundData.createInvestorFund.four_ratio_lvg

const clickOnStartButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.previewEligibilityFormLabels.startPreviewButtonLabel)
}
const fillPreviewFormDataAdmin = (country) => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 0, data.eligibilityData.createEligibility.investment_type)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 1, country)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.firstNameInput, data.eligibilityData.createEligibility.first_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.lastNameInput, data.eligibilityData.createEligibility.last_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.jobTitleInput, data.eligibilityData.createEligibility.job_title)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 2, data.eligibilityData.createEligibility.department)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 3, data.eligibilityData.createEligibility.job_band)

}
const fillPreviewFormData = (country) => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 0, data.eligibilityData.createEligibility.investment_type)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 1, country)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.firstNameInput, data.eligibilityData.createEligibility.first_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.lastNameInput, data.eligibilityData.createEligibility.last_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.jobTitleInput, data.eligibilityData.createEligibility.job_title)
    //Hide for invite only
    //pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 2, data.eligibilityData.createEligibility.department)
    //pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 3, data.eligibilityData.createEligibility.job_band)
}
const fillPreviewFormDataIN = (country) => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 0, data.eligibilityData.createEligibility.investment_type_indivisual)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 1, country)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.firstNameInput, data.eligibilityData.createEligibility.first_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.lastNameInput, data.eligibilityData.createEligibility.last_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.jobTitleInput, data.eligibilityData.createEligibility.job_title)
    //Hide for invite only
    //pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 2, data.eligibilityData.createEligibility.department)
    //pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 3, data.eligibilityData.createEligibility.job_band)
}

const fillPreviewFormDataWrongCountry = (country) => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 0, data.eligibilityData.createEligibility.investment_type_indivisual)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 1, country)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.firstNameInput, data.eligibilityData.createEligibility.first_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.lastNameInput, data.eligibilityData.createEligibility.last_name)
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.jobTitleInput, data.eligibilityData.createEligibility.job_title)
    //Hide for invite only
    //pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 2, data.eligibilityData.createEligibility.department)
    //pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 3, data.eligibilityData.createEligibility.job_band)
}

const fillAccreditedForm = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.accreditedRadioOption4)
}

const fillQualifiedPurchaserForm = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.qualifiedPurchaseOption)
}
const fillAccreditedFormWithOption2 = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.accreditedRadioOption1)
    pages.generalActions.checkBoxUsingLocator(elements.previewEligibilityFormElements.certifyCheckbox)
}

const fillKnowledgeableEmployeeForm = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.keRadioOption1)
}

const uploadFundTemplate = () => {
    pages.generalActions.uploadFileUsingLocator(elements.previewEligibilityFormElements.fileUploadInput, Cypress.env('fund_template_path'))
}
const uploadInvestmentStatement = () => {
    pages.generalActions.uploadFileUsingLocator(elements.previewEligibilityFormElements.fileUploadInputSecond, Cypress.env('fund_template_path'))
}

const verifyFundTemplateUpload = () => {
    pages.generalActions.getElementUsingLocator(elements.previewEligibilityFormElements.filenameSpan).should('be.visible')
    pages.generalActions.getElementUsingLocator(elements.previewEligibilityFormElements.deleteFileIcon).should('be.visible')
}

const clickOnNextButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.previewEligibilityFormLabels.nextButtonLabel)
}
const clickOnSubmitInfoButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.previewEligibilityFormLabels.submitInfo)
}

const verifyPreviewSubmitSuccess = () => {
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.previewSuccessMessage, successAlerts.previewFormSubmitSuccess)
}

const clickOnSubmitReviewButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.previewEligibilityFormLabels.submitReviewButtonLabel)
}

const fillSubmitReviewForm = (reviewer) => {
    pages.generalActions.typeInDropdownInput(elements.previewEligibilityFormElements.reviewerDropdownInput, reviewer)
}

const fillSubmitReviewFormForSecondCountry = (reviewer) => {
    pages.generalActions.typeInDropdownInput(elements.previewEligibilityFormElements.reviewerDropdownInput, reviewer)
}

const clickOnModalSendButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.previewEligibilityFormLabels.sendButtonLabel)
}

const verifySubmitReviewSuccess = () => {
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.successTitle, successAlerts.eligibilitySubmitSuccessTitle)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.successMessageBody, successAlerts.eligibilitySubmitSuccessMessage)
}

const closePopupModal = () => {
    pages.generalActions.clickOutsideOnBody()
}

const scrollToNextButton = () => {
    pages.generalActions.scrollToBottom()
}

// Investor Preview Form Actions
const fillEquityFormData = () => {
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.equityInput, data.investorFundData.createInvestorFund.equity_investment)
}

const clickOnEquityBar = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.equityBar)
}

const verifyEquityInputAlert = () => {
    pages.generalActions.typeInInput(elements.previewEligibilityFormElements.equityInput, data.investorFundData.createInvestorFund.lower_equity_value)
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.equityBar)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.errorDiv, failureAlerts.investorEquityAlert + ` ${equityAmount}`)
}

const verifyEligibilityLimitCheckLink = () => {
    pages.generalActions.getElementUsingLocator(elements.previewEligibilityFormElements.eligibilityLimitLink).should('be.visible').and('have.attr', 'href', data.investorFundData.createInvestorFund.eligibility_check_link)
}

const clickAndVerifyEquityAndLevergeValue = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.noneRadioBtn)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.equityBarValue, equityAmount)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.leverageBarValue, zeroLeverageAmount)
    // Three Ratio
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.threeRatioRadioBtn)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.equityBarValue, equityAmount)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.leverageBarValue, oneThirdLeverageAmount)
    // Four Ratio
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.fourRatioRadioBtn)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.equityBarValue, equityAmount)
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.leverageBarValue, oneFourthLeverageAmount)
}

const clickOnMyApplicationButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.goToMyApplicationBtn)
}
const verifyInvestmentCountryQuestions = () => {
    pages.generalActions.verifyElementsText(elements.previewEligibilityFormElements.investmentCountry, data.eligibilityData.createEligibility.country_question)
}
const verifyNotEligible = () => {
    pages.generalActions.verifyElementOnPage(elements.previewEligibilityFormElements.backButton)
    pages.generalActions.getElementUsingLabel(labels.previewEligibilityFormLabels.not_eligible_text)
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.backButton)
}
const clickOnBackButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.previewEligibilityFormElements.backButton)
}



const previewEligibilityFormActions = {
    clickOnStartButton,
    fillPreviewFormDataAdmin,
    fillPreviewFormData,
    clickOnNextButton,
    verifyPreviewSubmitSuccess,
    clickOnSubmitReviewButton,
    fillSubmitReviewForm,
    fillSubmitReviewFormForSecondCountry,
    fillAccreditedForm,
    fillAccreditedFormWithOption2,
    fillKnowledgeableEmployeeForm,
    uploadFundTemplate,
    verifyFundTemplateUpload,
    clickOnModalSendButton,
    verifySubmitReviewSuccess,
    closePopupModal,
    scrollToNextButton,
    fillEquityFormData,
    clickOnEquityBar,
    verifyEquityInputAlert,
    verifyEligibilityLimitCheckLink,
    clickAndVerifyEquityAndLevergeValue,
    clickOnMyApplicationButton,
    verifyInvestmentCountryQuestions,
    fillPreviewFormDataWrongCountry,
    verifyNotEligible,
    clickOnBackButton,
    fillQualifiedPurchaserForm,
    uploadInvestmentStatement,
    fillPreviewFormDataIN,
    clickOnSubmitInfoButton
}

export default previewEligibilityFormActions