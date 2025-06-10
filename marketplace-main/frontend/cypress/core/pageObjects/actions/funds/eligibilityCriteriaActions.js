import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'

const clickOnEligibilityTab = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createFundElements.eligibiltyCriteriaTab)
}

const clickOnCreateEligibilityButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.eligibilityCriteriaElements.createButton)
}

const fillEligibilityInitialPopupForm = (country) => {
    pages.generalActions.typeInDropdownInput(elements.eligibilityCriteriaElements.eligibilityCountryPopupInput, country)
}

const clickOnNextButtonInPopup = () => {
    pages.generalActions.clickButtonUsingLocator(elements.eligibilityCriteriaElements.nextButton)
}

const clickOnEligibilityFlowsButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.eligibilityCriteriaLabels.eligibilityFlowsReadyButtonLabel)
}

const clickOnActionsDotsButton = () => {
    pages.generalActions.clickNthButtonUsingLocator(elements.eligibilityCriteriaElements.actionsDotsButton, 0)
}

const verifyEditLinkIsDisabled = () => {
    pages.generalActions.verifyElementIsDisabledUsingLocator(elements.eligibilityCriteriaElements.muiPopoverDiv, labels.eligibilityCriteriaLabels.actionsEditLabel)
}

const verifyDeleteLinkIsDisabled = () => {
    pages.generalActions.verifyElementIsDisabledUsingLocator(elements.eligibilityCriteriaElements.muiPopoverDiv, labels.eligibilityCriteriaLabels.actionsDeleteLabel)
}

const clickOnDeleteLink = () => {
    pages.generalActions.clickTextElementUsingLocator(elements.eligibilityCriteriaElements.muiPopoverDiv, labels.eligibilityCriteriaLabels.actionsDeleteLabel)
}

const clickOnModalSubmitButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.eligibilityCriteriaLabels.modalSubmitButtonLabel)
}

const verifyEligibilityRecordIsDeleted = () => {
    pages.generalActions.getElementUsingLocator(elements.eligibilityCriteriaElements.eligibilityRowInTable).first().should('not.exist')
}

const eligibilityCriteriaActions = {
    clickOnEligibilityTab,
    clickOnCreateEligibilityButton,
    fillEligibilityInitialPopupForm,
    clickOnNextButtonInPopup,
    clickOnEligibilityFlowsButton,
    clickOnActionsDotsButton,
    verifyEditLinkIsDisabled,
    verifyDeleteLinkIsDisabled,
    clickOnDeleteLink,
    clickOnModalSubmitButton,
    verifyEligibilityRecordIsDeleted
}

export default eligibilityCriteriaActions