import * as pages from '../../../core/pageObjects/pages'

describe('TC03 Publish Funds After Approval of Eligibility', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('Click on First Element in My Tasks Table', { scrollBehavior: false }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('Approve the Assigned Task', { scrollBehavior: false }, () => {
        //pages.myTasksActions.verifyModalTitleText()
        pages.myTasksActions.clickOnPopupCloseButton()
        // Verify Preview Tab Working
        pages.myTasksActions.clickOnPreviewTab()
        // Add Comment in Textbox
        pages.myTasksActions.addCommentInTextbox()
        pages.myTasksActions.clickOnAddCommentButton()
        // Verify Request Revisions
        pages.myTasksActions.clickOnRequestRevisionsButton()
        pages.myTasksActions.clickOnPopupCloseButton()
        // Approve Task
        pages.myTasksActions.clickOnApproveButton()       
    });

    it('Publish Accept Applications for Fund', { scrollBehavior: false }, () => {
        pages.homeActions.clickOnFundsLinkInHeader()
        // Make Eligibility Flow Ready
        pages.homeActions.clickOnFundInTheTable()
        pages.eligibilityCriteriaActions.clickOnEligibilityTab()
        pages.eligibilityCriteriaActions.clickOnEligibilityFlowsButton()
        // Navigate to Funds Page Again
        pages.homeActions.clickOnFundsLinkInHeader()
        // Publish Investment
        pages.homeActions.clickOnActionsDotOptions()
        pages.homeActions.clickOnActionModalOptions()
        pages.homeActions.clickOnPopupSubmitButton()
        // Publish Opportunity
        pages.homeActions.clickOnActionsDotOptions()
        pages.homeActions.clickOnActionModalOptions()
        pages.homeActions.clickOnPopupSubmitButton()
        // Accept Applications
        pages.homeActions.clickOnActionsDotOptions()
        pages.homeActions.clickOnActionModalOptions()
        pages.homeActions.clickOnPopupSubmitButton()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})