import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'
import successAlerts from '../../../rules/successAlerts'

const verifyHeaderTitle = (country) => {
    pages.generalActions.verifyElementsText(elements.createEligibilityFormElements.pageTitle, country)
}

const editFinalBlockInputs = () => {
    pages.generalActions.typeInInput(elements.createEligibilityFormElements.notEligibleTextInput, data.eligibilityData.createEligibility.not_eligible_text)
    pages.generalActions.typeInInput(elements.createEligibilityFormElements.reviewTextInput, data.eligibilityData.createEligibility.review_text)
}

const addTextInCommentBox = () => {
    pages.generalActions.typeInInput(elements.createEligibilityFormElements.commentTextArea, data.eligibilityData.createEligibility.comment)
}

const clickOnAddCommentButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createEligibilityFormElements.addCommentButton)
}

const clickOnPreviewButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.createEligibilityFormLabels.previewButtonLabel)
}

const clickOnAddBlocksButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.createEligibilityFormLabels.addBlockButtonLabel)
}
const addQualifiedPurchaserBlock = () => {
    pages.generalActions.scrollIntoViewText(labels.createEligibilityFormLabels.usQualifiedPurchaserBlock).click()
    pages.generalActions.verifyElementsText(elements.createEligibilityFormElements.alertDiv, successAlerts.blockAddedAlert)
}
const addUSAccreditedBlock = () => {
    pages.generalActions.scrollIntoViewText(labels.createEligibilityFormLabels.usAccreditedInvestorBlock).click()
    pages.generalActions.verifyElementsText(elements.createEligibilityFormElements.alertDiv, successAlerts.blockAddedAlert)
}

const addUSKnowledgeableEmployeeBlock = () => {
    pages.generalActions.scrollIntoViewText(labels.createEligibilityFormLabels.usKnowledgeAbleEmployeeBlock).click()
    pages.generalActions.verifyElementsText(elements.createEligibilityFormElements.alertDiv, successAlerts.blockAddedAlert)
}

const closeAddBlocksModal = () => {
    pages.generalActions.clickButtonUsingLocator(elements.createEligibilityFormElements.closeModalButton)
}

const createEligibilityFormActions = {
    verifyHeaderTitle,
    editFinalBlockInputs,
    addTextInCommentBox,
    clickOnAddCommentButton,
    clickOnPreviewButton,
    clickOnAddBlocksButton,
    addUSAccreditedBlock,
    addUSKnowledgeableEmployeeBlock,
    closeAddBlocksModal,
    addQualifiedPurchaserBlock
}

export default createEligibilityFormActions