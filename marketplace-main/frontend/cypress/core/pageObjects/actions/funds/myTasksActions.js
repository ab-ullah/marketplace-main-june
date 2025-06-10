import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'
import successAlerts from '../../../rules/successAlerts'

const clickOnFirstEligibilityInTable = () => {
    //pages.generalActions.getElementUsingLocator(elements.myTasksElements.firstTableCol).first().click()
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.myTaskfirstTableCol)
}
const requestRevisions = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.firstNameClick)
    pages.generalActions.typeInInput(elements.myTasksElements.revisionInput, labels.myTasksLabels.requestRevisionInput)
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.modalSend)
    cy.wait(4000)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.requestRevisionButtonLabel)
    pages.generalActions.verifyElementsText(elements.myTasksElements.revisionAlert, labels.myTasksLabels.requestrevisionAlert)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.popupCloseButtonLabel)

}
const requestRevisionsFinacialAdmin = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.jobTitle)
    pages.generalActions.typeInInput(elements.myTasksElements.revisionInput, labels.myTasksLabels.requestRevisionInput)
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.modalSend)
    cy.wait(4000)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.requestRevisionButtonLabel)
    pages.generalActions.verifyElementsText(elements.myTasksElements.revisionAlert, labels.myTasksLabels.requestrevisionAlert)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.popupCloseButtonLabel)

}
const requestRevisionsFinacialAdminforKYCAML = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.contrychangeRequest)
    pages.generalActions.typeInInput(elements.myTasksElements.revisionInput, labels.myTasksLabels.requestRevisionInput)
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.modalSend)
    cy.wait(4000)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.requestRevisionButtonLabel)
    pages.generalActions.verifyElementsText(elements.myTasksElements.revisionAlert, labels.myTasksLabels.requestrevisionAlert)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.popupCloseButtonLabel)

}

const verifyModalTitleText = () => {
    pages.generalActions.verifyElementsText(elements.myTasksElements.modalTitle, data.myTasksData.myTasks.modalTitle)
}

const clickOnPopupCloseButton = () => {
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.popupCloseButtonLabel)
}

const clickOnPreviewTab = () => {
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.previewTabLabel)
}

const addCommentInTextbox = () => {
    pages.generalActions.typeInInput(elements.myTasksElements.commentTextAreaInput, data.myTasksData.myTasks.comment)
}

const addRequestRevisionComment = () => {
    pages.generalActions.typeInInput(elements.myTasksElements.commentTextAreaInput, data.myTasksData.myTasks.requestRevisionText)
}

const clickOnAddCommentButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.addCommentButton)
}

const clickOnRequestRevisionsButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.requestRevisionsButton)
}

const verifyRevisionRequestedAlertDisplayed = () => {
    pages.generalActions.verifyElementsText(elements.homeElements.modalBody, successAlerts.revisionRequestedAlert)
}

const clickOnApproveButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.approveButton)
}

const verifyRequestRevisionButtonDisappeared = () => {
    pages.generalActions.verifyElementDoesNotExistUsingLocator(elements.myTasksElements.requestRevisionsButton)
}

const verifyChangesRequestedLabelDisplayed = () => {
    pages.generalActions.verifyNthElementsText(elements.myTasksElements.tableDataCol, 5, labels.myTasksLabels.reviewRequest)
}

const verifyPendingLabelDisplayed = () => {
    pages.generalActions.verifyNthElementsText(elements.myTasksElements.tableDataCol, 5, labels.myTasksLabels.pendingStatusForTask)
}

// My Tasks Details Page Actions
const clickOnFlagIcon = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.flagIconSpan)
}

const typeInCreateRequestsTextarea = () => {
    pages.generalActions.typeInInput(elements.myTasksElements.createRequestModalTextarea, data.myTasksData.myTasks.lastNameRequest)
}

const clickOnSendButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.createRequestModalSendButton)
}

const verifyApproveButtonIsDisplayed = () => {
    pages.generalActions.verifyElementsText(elements.myTasksElements.approveButtonForFlag, labels.myTasksLabels.approveButtonLabel)
}
const clickOnRevisionApprove = () => {
    //pages.generalActions.clickButtonUsingLocator(elements.myTasksElements.clickOnApprove)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.clickonApproveButton)
    pages.generalActions.clickButtonUsingLabel(labels.myTasksLabels.popupCloseButtonLabel)

}

const myTasksActions = {
    clickOnFirstEligibilityInTable,
    requestRevisions,
    requestRevisionsFinacialAdmin,
    verifyModalTitleText,
    clickOnPopupCloseButton,
    clickOnPreviewTab,
    addCommentInTextbox,
    addRequestRevisionComment,
    clickOnAddCommentButton,
    clickOnRequestRevisionsButton,
    verifyRevisionRequestedAlertDisplayed,
    clickOnApproveButton,
    verifyRequestRevisionButtonDisappeared,
    verifyChangesRequestedLabelDisplayed,
    verifyPendingLabelDisplayed,
    clickOnFlagIcon,
    typeInCreateRequestsTextarea,
    clickOnSendButton,
    verifyApproveButtonIsDisplayed,
    clickOnRevisionApprove,
    requestRevisionsFinacialAdminforKYCAML
}

export default myTasksActions