import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'

const fundTitle = pages.createFundActions.exportFundTitle().toString()

const verifyTitleHeader = () => {
    pages.generalActions.verifyElementsText(elements.myApplicationElements.titleHeader, labels.myApplicationLabels.titleHeaderLabel)
}

const verifyFundTitle = () => {
    pages.generalActions.verifyElementsText(elements.myApplicationElements.fundTitleHeader, fundTitle)
}

const modifyInvestCountryValue = (country) => {
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.previewEligibilityFormElements.dropdownInput, 1, country)
}

const clickOnModalYesButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myApplicationElements.modalYesButton)
}

const clickOnSubmitChangesButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myApplicationElements.submitChangesButton)
}

const clickOnModalCloseButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myApplicationElements.modalCloseButton)
}

const verifyEligibilityDecisionSpanIsPending = () => {
    pages.generalActions.verifyElementsText(elements.myApplicationElements.eligibilityDecisionSpan, labels.myApplicationLabels.pendingButtonText)
}

const verifyNewRequestButtonIsDisplayed = () => {
    pages.generalActions.getElementUsingLabel('New Request').should('be.visible')
}

const verifyUpdatedButtonIsDisplayed = () => {
    pages.generalActions.getElementUsingLabel('Reply').should('be.visible')
}

const changeLastNameInput = () => {
    pages.generalActions.typeInInput(elements.myApplicationElements.lastNameInput, data.myApplicationsData.myApplications.newLastName)
}

const verifyChangeRequestText = () => {
    pages.generalActions.verifyTextOnPage(data.myApplicationsData.myApplications.lastNameRequest)
}
const continueyourApplication = () => {
    cy.get(elements.myApplicationElements.continueyourapplicationbutton).click()
}
const wait2Sec = () => {
    cy.wait(3000)
}
const wait5Sec = () => {
    cy.wait(5000)
}
const wait10Sec = () => {
    cy.wait(10000)
}
const myApplicationActions = {
    verifyTitleHeader,
    verifyFundTitle,
    modifyInvestCountryValue,
    clickOnModalYesButton,
    clickOnSubmitChangesButton,
    clickOnModalCloseButton,
    verifyEligibilityDecisionSpanIsPending,
    verifyNewRequestButtonIsDisplayed,
    verifyUpdatedButtonIsDisplayed,
    changeLastNameInput,
    verifyChangeRequestText,
    continueyourApplication,
    wait2Sec,
    wait5Sec,
    wait10Sec,
    continueyourApplication
}

export default myApplicationActions