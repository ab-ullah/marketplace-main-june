import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'

const docRandTitle = data.companyPageData.companyData.poa_doc_title + ' ID: ' + pages.generalActions.randomNumberGenerator(99999)

const verifyCompanyPageUrl = () => {
    pages.generalActions.verifyUrl('/admin/company')
}

const verifyHeaderTitle = () => {
    pages.generalActions.verifyElementsText(elements.companyElements.headerTitle, labels.homeLabels.companyHeaderLabel)
}

const uploadCompanyLogo = () => {
    pages.generalActions.uploadFileUsingLocator(elements.companyElements.fileUploadInput, Cypress.env('company_logo_path'))
}

const verifyAndTypeInInput = () => {
    pages.generalActions.verifyInputIsNotEmpty(elements.companyElements.nameInput)
    pages.generalActions.typeInInput(elements.companyElements.emailInput, data.companyPageData.companyData.support_email)
}

const clickOnAddDocumentButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.companyElements.addDocumentButton)
}

const typeInNameAndDescriptionInput = () => {
    pages.generalActions.typeInInput(elements.companyElements.modalNameInput, docRandTitle)
    pages.generalActions.typeInInput(elements.companyElements.descriptionInput, data.companyPageData.companyData.poa_doc_description)
}

const uploadDocument = () => {
    pages.generalActions.uploadFileUsingLocator(elements.companyElements.modalFileUploadInput, Cypress.env('fund_template_path'))
}

const clickOnRequireCheckboxes = () => {
    pages.generalActions.clickButtonUsingLocator(elements.companyElements.requiredOnceCheckbox)
    pages.generalActions.clickButtonUsingLocator(elements.companyElements.requiredSignCheckbox)
    pages.generalActions.clickButtonUsingLocator(elements.companyElements.requiredWetSignCheckbox)
}

const clickOnSaveButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.companyElements.saveButton)
}

const verifyDocSubmission = () => {
    pages.generalActions.verifyElementOnPage(elements.companyElements.docTitleCell)
}
const deleteCompanyDocument = () => {
    pages.generalActions.clickButtonUsingLocator(elements.companyElements.deleteFile)
}

const companyActions = {
    verifyCompanyPageUrl,
    verifyHeaderTitle,
    uploadCompanyLogo,
    verifyAndTypeInInput,
    clickOnAddDocumentButton,
    typeInNameAndDescriptionInput,
    uploadDocument,
    clickOnRequireCheckboxes,
    clickOnSaveButton,
    verifyDocSubmission,
    deleteCompanyDocument
}

export default companyActions