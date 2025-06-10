import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

describe('TC02 Multiple Eligibility Criteria Test', () => {

    context('Create Fund', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('C1240: Verify Admin creates a fund', () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()

            // Verify Fund Data and Save
            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.clickOnSaveButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Create Eligibility For US', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('C1239: Verify create Eligibility Criteria for an existing fund for a single country', { scrollBehavior: false }, () => {
            pages.homeActions.clickOnFundTitleInTheTable()
            // Start eligibility process
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            // Add Comment
            pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
            pages.createEligibilityFormActions.addTextInCommentBox()
            pages.createEligibilityFormActions.clickOnAddCommentButton()
            pages.createEligibilityFormActions.editFinalBlockInputs()
        })
    
        it('C1241: Verify configuration of Eligibility form for the United States', { scrollBehavior: false }, () => {
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.createEligibilityFormActions.addUSAccreditedBlock()
            pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
            pages.createEligibilityFormActions.closeAddBlocksModal()

            pages.createEligibilityFormActions.clickOnPreviewButton()
            //pages.previewEligibilityFormActions.clickOnStartButton()
            // fill first form
            pages.previewEligibilityFormActions.fillPreviewFormData(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill second form
            pages.previewEligibilityFormActions.fillAccreditedForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill third form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()
        })
    
        it('C1244: Verify Admin sends form for review', { scrollBehavior: false }, () => {
            pages.previewEligibilityFormActions.clickOnSubmitReviewButton()
            pages.previewEligibilityFormActions.fillSubmitReviewForm(data.eligibilityData.createEligibility.reviewer)
            pages.previewEligibilityFormActions.clickOnModalSendButton()
            pages.previewEligibilityFormActions.verifySubmitReviewSuccess()
            pages.previewEligibilityFormActions.closePopupModal()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Publish Eligibility For US', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('C1245: Verify Admin publishes all the eligibility forms', { scrollBehavior: false }, () => {
            pages.homeActions.clickOnMyTasksButton()
            pages.myTasksActions.clickOnFirstEligibilityInTable()
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
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Create Eligibility For Japan', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })

        it('C1248: Verify Admin creates two eligibility forms for different countries', { scrollBehavior: false }, () => {
            pages.homeActions.clickOnFundTitleInTheTable()
            // Start eligibility process
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.second_country)
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            // Add Comment
            pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.sec_investment_country)
            pages.createEligibilityFormActions.addTextInCommentBox()
            pages.createEligibilityFormActions.clickOnAddCommentButton()
            pages.createEligibilityFormActions.editFinalBlockInputs()
        })
    
        it('C1296: Verify configuration of Eligibility form for the second country', { scrollBehavior: false }, () => {
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.createEligibilityFormActions.addUSAccreditedBlock()
            pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
            pages.createEligibilityFormActions.closeAddBlocksModal()

            pages.createEligibilityFormActions.clickOnPreviewButton()
            //pages.previewEligibilityFormActions.clickOnStartButton()
            // fill first form
            pages.previewEligibilityFormActions.fillPreviewFormData(data.eligibilityData.createEligibility.sec_investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill second form
            pages.previewEligibilityFormActions.fillAccreditedForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill third form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()
        })
    
        it('C1297: Verify Admin sends form of second country for review', { scrollBehavior: false }, () => {
            pages.previewEligibilityFormActions.clickOnSubmitReviewButton()
            pages.previewEligibilityFormActions.fillSubmitReviewForm(data.eligibilityData.createEligibility.reviewer)
            pages.previewEligibilityFormActions.clickOnModalSendButton()
            pages.previewEligibilityFormActions.verifySubmitReviewSuccess()
            pages.previewEligibilityFormActions.closePopupModal()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Publish Eligibility For Japan', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('C1245: Verify Admin publishes all the eligibility forms', { scrollBehavior: false }, () => {
            pages.homeActions.clickOnMyTasksButton()
            pages.myTasksActions.clickOnFirstEligibilityInTable()
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
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Approve Eligibility Flows', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })

        it('C1249: Verify Admin approves all eligibility flows', { scrollBehavior: false }, () => {
            // Make Eligibility Flow Ready
            pages.homeActions.clickOnFundTitleInTheTable()
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            // Publish Flows
            pages.eligibilityCriteriaActions.clickOnEligibilityFlowsButton()
            // Verify Edit and Delete
            pages.generalActions.waitForTime(3000)
            pages.eligibilityCriteriaActions.clickOnActionsDotsButton()
            pages.eligibilityCriteriaActions.verifyEditLinkIsDisabled()
            pages.eligibilityCriteriaActions.verifyDeleteLinkIsDisabled()
            pages.generalActions.clickOutsideOnBody()
        });
        
        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Approve and Publish Fund', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('C1250: Verify Admin publishes the investment', { scrollBehavior: false }, () => {
            // Publish Investment
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()  
        })

        it('C1246: Verify Admin publishes the opportunity', { scrollBehavior: false }, () => {
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()
        })

        it('C1247: Verify Admin accepts the applications', { scrollBehavior: false }, () => {
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
        })
        
        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

})