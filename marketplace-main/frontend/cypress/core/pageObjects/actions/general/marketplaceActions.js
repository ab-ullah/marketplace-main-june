/// <reference types= "cypress" />
import * as elements from '../../elements'
import * as pages from '../../pages'
import * as labels from '../../labels'

const marketplacelogout = () => {
    pages.generalActions.clickButtonUsingLocator(elements.marketplaceElements.navDropdownLink)
    pages.generalActions.clickButtonUsingLocator(elements.marketplaceElements.logoutLink)
}
const marketplaceHomepageConditions = () => {
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.firstCheckBox).check()
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.secondCheckBox).check()
    pages.generalActions.clickButtonUsingLocator(elements.marketplaceElements.confirmButton)
}
const marketplaceHomepageConditionsAll = () => {
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.checkAllHomepage).check()
    pages.generalActions.clickButtonUsingLocator(elements.marketplaceElements.confirmButton)
}
const fillInvestorInformationForm = () => {
    pages.generalActions.clickButtonUsingLocator(elements.marketplaceElements.submitButton)
    pages.generalActions.waitForTime(2000)
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.investRadioButton).check()
    pages.generalActions.typeInDropdownInput(elements.marketplaceElements.wheretoInvest, labels.marketplaceLabels.country)
    pages.generalActions.typeInInput(elements.marketplaceElements.firstName, labels.marketplaceLabels.firstName)
    pages.generalActions.typeInInput(elements.marketplaceElements.lastName, labels.marketplaceLabels.lastName)
    pages.generalActions.clickButtonUsingLocator(elements.marketplaceElements.submitButton)
}
const fillmarketplaceSecondForm = () => {
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.firstOption).check()
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.checkbox).check()
    pages.generalActions.scrollToBottom()
    pages.generalActions.clickButtonUsingLabel(labels.marketplaceLabels.nextButton)
}
const fillmarketplaceThirdForm = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.knowOptionFirst).check()
    pages.generalActions.scrollToBottom()
    pages.generalActions.clickButtonUsingLabel(labels.marketplaceLabels.nextButton)
}
const fillmarketplaceForthFormandVerification = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.typeInInput(elements.marketplaceElements.investingValue, labels.marketplaceLabels.amount)
    pages.generalActions.getElementUsingLocator(elements.marketplaceElements.investingRadio).check()
    pages.generalActions.scrollToBottom()
    pages.generalActions.clickButtonUsingLabel(labels.marketplaceLabels.submitButton)
    pages.generalActions.verifyFieldValue(elements.marketplaceElements.heading, labels.marketplaceLabels.submitButton)
    pages.generalActions.clickButtonUsingLabel(labels.marketplaceLabels.seeAllFundsLink)


}




const marketplaceActions = {
    marketplacelogout,
    marketplaceHomepageConditions,
    marketplaceHomepageConditionsAll,
    fillInvestorInformationForm,
    fillmarketplaceSecondForm,
    fillmarketplaceThirdForm,
    fillmarketplaceForthFormandVerification


}

export default marketplaceActions