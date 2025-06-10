import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'

const clickOnApplicantManagementTab = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.applicantManagementTab)
}

const verifyHeaderTitle = () => {
    pages.generalActions.getElementUsingLocator(elements.applicantManagementElements.fundTitleHeader).should('be.visible')
}

const verifyApplicantRecordInTable = () => {
    pages.generalActions.getElementUsingLocator(elements.applicantManagementElements.applicantTableRow).should('be.visible')
}

const clickOnActionsDotIcon = () => {
    pages.generalActions.clickButtonUsingLocator(elements.applicantManagementElements.actionDotIcon)
}

const clickOnViewSubActionLink = () => {
    pages.generalActions.clickButtonUsingLabel(labels.applicantManagementLabels.viewSubActionLabel)
}

const verifyInvestorViewPageTitles = () => {
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.overviewTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.personalInformationTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.homeAddressTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.uploadDocumentTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.investmentAmountTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.eligibilityCriteriaTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.taxDetailsTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.taxFormsTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.bankingDetailsTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.documentsTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.programDocumentsTitleLabel).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.applicantManagementLabels.internalSupportingDocumentTitleLabel).should('be.visible')
}

const clickOnEditSubActionLink = () => {
    pages.generalActions.clickButtonUsingLocator(elements.applicantManagementElements.editSubActionLocatorNotApproved)
}
const clickOnApproveSubActionLink = () => {
    pages.generalActions.clickButtonUsingLocator(elements.applicantManagementElements.approveLink)
}
const clickOnEditSubActionbeforeApproval = () => {
    pages.generalActions.clickButtonUsingLocator(elements.applicantManagementElements.editSubActionLocator)
}
const selectVehicleOption = () => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.applicantManagementElements.vehicleOptionDropdown, 0, data.applicantManagementPageData.applicantManagementData.vehicle_type)
}
const selectShareClassOption = () => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.applicantManagementElements.shareclass, 0, data.applicantManagementPageData.applicantManagementData.share_class)
}
const selectVehicleAndShareClassOption = () => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.applicantManagementElements.vehicleOptionDropdown, 0, data.applicantManagementPageData.applicantManagementData.vehicle_type)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.applicantManagementElements.shareclass, 0, data.applicantManagementPageData.applicantManagementData.share_class)
}
const addInvestorAccountCodeValue = () => {
    pages.generalActions.typeInInput(elements.applicantManagementElements.investorAccountCodeInput, data.applicantManagementPageData.applicantManagementData.inv_account_code)
}

const clickOnSaveButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.applicantManagementLabels.saveButtonLabel)
}
const clickOnEditApplicantSaveButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.applicantManagementElements.editApplicantSaveButton)
}

const clickOnAddDocRequestButton = () => {
    pages.generalActions.getElementUsingLocator(elements.applicantManagementElements.addDocumentRequest).click({
        force: true
    })
}

const addRequestDocNameAndDescription = () => {
    pages.generalActions.typeInInput(elements.applicantManagementElements.requestDocNameInput, data.applicantManagementPageData.applicantManagementData.request_doc_name)
    pages.generalActions.typeInInput(elements.applicantManagementElements.requestDocDescriptionInput, data.applicantManagementPageData.applicantManagementData.request_doc_description)

}
const addRequestDocSveButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.applicantManagementElements.addRequestDocSveButton)

}
const verifyUploadedDocument = () => {
    pages.generalActions.verifyElementOnPage(elements.applicantManagementElements.adminDocumentVerification)

}


const applicantManagementActions = {
    clickOnApplicantManagementTab,
    verifyHeaderTitle,
    verifyApplicantRecordInTable,
    clickOnActionsDotIcon,
    clickOnViewSubActionLink,
    verifyInvestorViewPageTitles,
    clickOnEditSubActionLink,
    clickOnApproveSubActionLink,
    selectShareClassOption,
    selectVehicleOption,
    selectVehicleAndShareClassOption,
    addInvestorAccountCodeValue,
    clickOnSaveButton,
    clickOnEditApplicantSaveButton,
    clickOnAddDocRequestButton,
    addRequestDocNameAndDescription,
    addRequestDocSveButton,
    verifyUploadedDocument,
    clickOnEditSubActionbeforeApproval
}

export default applicantManagementActions