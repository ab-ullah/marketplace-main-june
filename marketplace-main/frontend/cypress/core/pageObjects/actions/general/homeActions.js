import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'

let getText
var SavedDocName;
const verifyFundsHomeUrl = () => {
    pages.generalActions.verifyUrl('/admin/funds')
}

const verifyHeaderTitleText = () => {
    pages.generalActions.getElementUsingLabel(labels.homeLabels.fundsListLabel).should('be.visible')
}

const verifyheaderdescription = () => {
    pages.generalActions.getElementUsingLabel(labels.homeLabels.fundlistdescription).should('be.visible')
}

const inputsearchonfundlisting = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.searchinput).type("tayyab demo")

}
const cliontasklinkinheader = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.tasklinkonheader).click()

}

const clickOnFundsLinkInHeader = () => {
    pages.generalActions.clickButtonUsingLabel(labels.homeLabels.fundsLinkInHeaderLabel)
}

const clickOnCreateFundBtn = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.createFundButton).should('be.visible').click()
}

const clickOnLogoutButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.logoutButton)
}

const clickOnFundInTheTable = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.tableFundsListColLink).first().click()
}
const clickLatestFund = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.firstfund).then(($vc) => {
        getText = $vc.text()
        cy.contains(getText).click()
    })
}
const getLatestFundID = () => {
    return `${getText} `
}
const getLatestDocument = () => {
    cy.get("[aria-rowindex=2] > .rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content > .rs-table-cell-wrap > .sc-bQCEYZ").then(($DocName) => {
        SavedDocName = $DocName.text()
        cy.contains(SavedDocName)

    })
    return `${SavedDocName} `
}

const clickOn1stFundTitleInTheTable = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.firstfund)
}

const clickOnFundTitleInTheTable = () => {
    pages.generalActions.clickButtonUsingLabel(pages.createFundActions.exportFundTitle())
}

const clickOnApplicantReviewFund = () => {
    pages.generalActions.clickButtonUsingLabel('Tue May 09 2023, Fund ID 210266')
}

const clickOnMyTasksButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.homeLabels.myTasksLabel)
}

const clickOnActionsDotOptions = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.actionsDotOptionsElem).first().click()
}

const clickOnActionModalOptions = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.actionModalOptions)
}

const clickOnActionModalOptionThroughText = (text) => {
    pages.generalActions.verifyElementsText(text).should('be.visible').click()
}

const clickOnPublishOpportunityOption = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.publishOpportunityOption)
}

const clickOnPopupSubmitButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.homeLabels.popupSubmitButtonLabel)
}

const clickOnEditFundDocumentLink = () => {
    pages.generalActions.clickNthButtonUsingLocator(elements.homeElements.editFundDocumentLink, 0)
}

const verifyModalTitleIsDisplayed = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.modalTitle).should('be.visible')
}

const uploadFundTemplate = () => {
    pages.generalActions.uploadFileUsingLocator(elements.homeElements.fileUploadInput, Cypress.env('fund_template_path'))
}

const verifyFundDocumnetUpload = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.docNameSpan).should('be.visible')
    pages.generalActions.getElementUsingLocator(elements.homeElements.deleteFileIcon).should('be.visible')
}

const clickRequiredCheckboxesOnModal = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.requireSignCheckbox)
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.requireGPSignCheckbox)
}

const selectGPSignerFromDropdown = () => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.homeElements.dropdownInput, 1, data.eligibilityData.createEligibility.reviewer)
}

const clickOnCloseModalButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.closeModalButton)
}

const clickOnCompanyHeaderLink = () => {
    pages.generalActions.clickButtonUsingLocator(elements.homeElements.companyHeaderLink)
}

const typeInFilterInput = () => {
    pages.generalActions.typeInInput(elements.homeElements.filterInputBar, data.fundData.createFund.filterFundTitle)
}

const verifyFilteredFundResult = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.filteredFund)
}
const verifyDocumentUpload = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.documentSpan).should('be.visible')
    pages.generalActions.getElementUsingLocator(elements.homeElements.deleteIcon).should('be.visible')
}
const goback = () => {

    return cy.go(-1)
}
const reloadpage = () => {
    cy.reload()
}
const uploadDocsCE = () => {
    pages.generalActions.uploadFileUsingLocator(elements.homeElements.fileUploadInput, Cypress.env('company_logo_path'))
}
const uploadDocsRequiredSignature = () => {
    pages.generalActions.uploadFileUsingLocator(elements.homeElements.fileUploadInput, Cypress.env('company_logo_path'))
}
const checkRequiredSignature = () => {
    pages.generalActions.getElementUsingLocator(elements.homeElements.requiredSignatureCheckBox).first().check()
}


const homeActions = {
    verifyFundsHomeUrl,
    uploadDocsRequiredSignature,
    verifyHeaderTitleText,
    clickOnFundsLinkInHeader,
    clickOnCreateFundBtn,
    clickOnLogoutButton,
    clickOnFundInTheTable,
    clickOnFundTitleInTheTable,
    clickOnApplicantReviewFund,
    clickOnMyTasksButton,
    clickOnActionsDotOptions,
    clickOnActionModalOptions,
    clickOnActionModalOptionThroughText,
    clickOnPublishOpportunityOption,
    clickOnPopupSubmitButton,
    clickOnEditFundDocumentLink,
    verifyModalTitleIsDisplayed,
    uploadFundTemplate,
    verifyFundDocumnetUpload,
    clickRequiredCheckboxesOnModal,
    selectGPSignerFromDropdown,
    clickOnCloseModalButton,
    clickOnCompanyHeaderLink,
    typeInFilterInput,
    verifyFilteredFundResult,
    goback,
    getLatestDocument,
    getLatestFundID,
    reloadpage,
    clickLatestFund,
    inputsearchonfundlisting,
    verifyheaderdescription,
    clickOn1stFundTitleInTheTable,
    uploadDocsCE,
    verifyDocumentUpload,
    checkRequiredSignature

}

export default homeActions