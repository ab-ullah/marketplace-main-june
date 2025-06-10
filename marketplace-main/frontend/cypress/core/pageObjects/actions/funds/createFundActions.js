/// <reference types="cypress"/>
import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'
import successAlerts from '../../../rules/successAlerts'

const fundTitle = pages.generalActions.fundTitleGenerator()

const fillCreateFundForm = () => {

    // type in all input fields
    pages.generalActions.typeInInput(elements.createFundElements.fundNameInp, fundTitle)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.createFundElements.fundDomicileCountryInp, 0, data.fundData.createFund.country)
    pages.generalActions.typeInInput(elements.createFundElements.focusRegionCountryInp, data.fundData.createFund.focus_region)
    pages.generalActions.typeInInput(elements.createFundElements.fundTypeInp, data.fundData.createFund.type)
    pages.generalActions.typeInInput(elements.createFundElements.riskProfileInp, data.fundData.createFund.risk_profile)
    pages.generalActions.typeInInput(elements.createFundElements.investementPeriodInp, data.fundData.createFund.investment_period)
    pages.generalActions.typeInInput(elements.createFundElements.fundPageInp, data.fundData.createFund.fund_page)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.createFundElements.currencyOfFundInp, 1, data.fundData.createFund.currency)
    pages.generalActions.typeInInput(elements.createFundElements.minEquityInvestmentInp, data.fundData.createFund.minimum_equity_investment)
    pages.generalActions.typeInInput(elements.createFundElements.targetFundSizeInp, data.fundData.createFund.target_fund_size)
    pages.generalActions.typeInInput(elements.createFundElements.firmCoInvestmentInp, data.fundData.createFund.firm_co_invest_committment)
    pages.generalActions.scrollIntoBottomUsingLocator(elements.createFundElements.createModal)

    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.openCloseStatusInp, pages.generalActions.randomNumberGenerator(1)).click()
    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.fundInviteTypeInp, pages.generalActions.randomNumberGenerator(0)).click()
    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.fundLeverageInp, pages.generalActions.randomNumberGenerator(1)).click()

}
const fillCreateFundFormInviteOnly = () => {

    // type in all input fields
    pages.generalActions.typeInInput(elements.createFundElements.fundNameInp, fundTitle)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.createFundElements.fundDomicileCountryInp, 0, data.fundData.createFund.country)
    pages.generalActions.typeInInput(elements.createFundElements.focusRegionCountryInp, data.fundData.createFund.focus_region)
    pages.generalActions.typeInInput(elements.createFundElements.fundTypeInp, data.fundData.createFund.type)
    pages.generalActions.typeInInput(elements.createFundElements.riskProfileInp, data.fundData.createFund.risk_profile)
    pages.generalActions.typeInInput(elements.createFundElements.investementPeriodInp, data.fundData.createFund.investment_period)
    pages.generalActions.typeInInput(elements.createFundElements.fundPageInp, data.fundData.createFund.fund_page)
    pages.generalActions.typeInDropdownInputAtNthIndex(elements.createFundElements.currencyOfFundInp, 1, data.fundData.createFund.currency)
    pages.generalActions.typeInInput(elements.createFundElements.minEquityInvestmentInp, data.fundData.createFund.minimum_equity_investment)
    pages.generalActions.typeInInput(elements.createFundElements.targetFundSizeInp, data.fundData.createFund.target_fund_size)
    pages.generalActions.typeInInput(elements.createFundElements.firmCoInvestmentInp, data.fundData.createFund.firm_co_invest_committment)

    // radio selections
    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.openCloseStatusInp, pages.generalActions.randomNumberGenerator(1)).click()
    //Hide due to invite only
    //pages.generalActions.getNthElementUsingLocator(elements.createFundElements.fundInviteTypeInp, pages.generalActions.randomNumberGenerator(0)).click()
    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.fundLeverageInp, pages.generalActions.randomNumberGenerator(1)).click()

}
const fillCreateFundFormInvite = () => {
    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.fundInviteTypeInp, 1).click()
}
const uploadFundTemplateInvite = () => {
    pages.generalActions.uploadFileUsingLocator(elements.createFundElements.uploadfileinvite, Cypress.env('fund_template_invite'))
}
const exportFundTitle = () => {
    return fundTitle
}

const clickOnInviteAllOption = () => {
    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.fundInviteTypeInp, 0).click()
}

const clickOnCreateButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.createFundFormBtn)
}
const verifySavePageUrl = () => {
    pages.generalActions.verifyUrl(`/admin/funds/${fundTitle}`)
}

const verifyFundTitle = () => {
    pages.generalActions.getElementUsingLocator(elements.createFundElements.createFundTitle).should('be.visible')
}

const verifyFundData = () => {

    pages.generalActions.verifyInputValue(elements.createFundElements.fundNameInp, fundTitle)
    pages.generalActions.verifyInputValue(elements.createFundElements.focusRegionCountryInp, data.fundData.createFund.focus_region)
    pages.generalActions.verifyInputValue(elements.createFundElements.fundTypeInp, data.fundData.createFund.type)
    pages.generalActions.verifyInputValue(elements.createFundElements.riskProfileInp, data.fundData.createFund.risk_profile)
    pages.generalActions.verifyInputValue(elements.createFundElements.investementPeriodInp, data.fundData.createFund.investment_period)
    pages.generalActions.verifyInputValue(elements.createFundElements.fundPageInp, data.fundData.createFund.fund_page)
    pages.generalActions.verifyInputValue(elements.createFundElements.minEquityInvestmentInp, data.fundData.createFund.minimum_equity_investment)
    pages.generalActions.verifyInputValue(elements.createFundElements.targetFundSizeInp, data.fundData.createFund.target_fund_size)
    pages.generalActions.verifyInputValue(elements.createFundElements.firmCoInvestmentInp, data.fundData.createFund.firm_co_invest_committment)

    //verify partner id input is not empty
    pages.generalActions.verifyInputIsNotEmpty(elements.createFundElements.partnerIdInp)

}

const scrollToSaveButton = () => {
    pages.generalActions.scrollToBottom()
}

const clickOnSaveButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.saveFundButton)
}

const verifySuccessAlertOnFundSave = () => {
    pages.generalActions.getElementUsingLocator(elements.createFundElements.alertDiv).should('be.visible')
    pages.generalActions.verifyElementsText(elements.createFundElements.alertDiv, successAlerts.saveFundAlert)
}

const clickOnDeleteFundButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.deleteFundButton)
}

const clickOnInviteOnlyOption = () => {
    pages.generalActions.getNthElementUsingLocator(elements.createFundElements.fundInviteTypeInp, 1).click()
}
const redirectToHomepage = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.redirectToHomepage)
}
const goToHomepageButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.goToHomepageButton)
}
const goToFundSetuptab = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.fundSetupTab)
}

const createFundActions = {
    fillCreateFundForm,
    fillCreateFundFormInvite,
    uploadFundTemplateInvite,
    clickOnInviteAllOption,
    clickOnCreateButton,
    exportFundTitle,
    verifySavePageUrl,
    verifyFundTitle,
    verifyFundData,
    scrollToSaveButton,
    clickOnSaveButton,
    verifySuccessAlertOnFundSave,
    clickOnDeleteFundButton,
    clickOnInviteOnlyOption,
    redirectToHomepage,
    fillCreateFundFormInviteOnly,
    goToHomepageButton,
    goToFundSetuptab
}

export default createFundActions