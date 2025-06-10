import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

describe('TC15 Request Revisions from Investor', () => {

    context('Create Fund', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('Create Fund Test', () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()
        })
    
        it('Verify Fund Data and Save', { scrollBehavior: false }, () => {
            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.clickOnSaveButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Add Eligibility for Fund', () => {
        
        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('Open the First Fund in the Table', () => {
            pages.homeActions.clickOnFundInTheTable()
        })
    
        it('Eligibility Criteria Check For Latest Fund', { scrollBehavior: false }, () => {
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
        })
    
        it('Create Eligibility Form Page', { scrollBehavior: false }, () => {
            pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
            pages.createEligibilityFormActions.addTextInCommentBox()
            pages.createEligibilityFormActions.clickOnAddCommentButton()
            pages.createEligibilityFormActions.editFinalBlockInputs()
        })
    
        it('Add Blocks for US', { scrollBehavior: false }, () => {
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.createEligibilityFormActions.addUSAccreditedBlock()
            pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
            pages.createEligibilityFormActions.closeAddBlocksModal()
        })
    
        it('Fill Preview Form', { scrollBehavior: false }, () => {
            pages.createEligibilityFormActions.clickOnPreviewButton()
            pages.previewEligibilityFormActions.clickOnStartButton()
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
    
        it('Submit for Review', { scrollBehavior: false }, () => {
            pages.previewEligibilityFormActions.clickOnSubmitReviewButton()
            pages.previewEligibilityFormActions.fillSubmitReviewForm(data.eligibilityData.createEligibility.knowledgeable_reviewer)
            pages.previewEligibilityFormActions.clickOnModalSendButton()
            pages.previewEligibilityFormActions.verifySubmitReviewSuccess()
            pages.previewEligibilityFormActions.closePopupModal()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Publish Eligibility for Fund', () => {

        before(() => {
            pages.generalActions.loginKnowledgeableAdminUser()
        })

        it('Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
    
        it('Click on First Element in My Tasks Table', { scrollBehavior: false }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        })
    
        it('Approve the Assigned Task', { scrollBehavior: false }, () => {
            //pages.myTasksActions.verifyModalTitleText()
            pages.myTasksActions.clickOnPopupCloseButton()
            // Verify Preview Tab Working
            pages.myTasksActions.clickOnPreviewTab()
            // Add Comment in Textbox
            pages.myTasksActions.addCommentInTextbox()
            pages.myTasksActions.clickOnAddCommentButton()
            // Approve Task
            pages.myTasksActions.clickOnApproveButton()       
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Approve Eligibility Flows', () => {

        before(() => {
            pages.generalActions.loginKnowledgeableAdminUser()
        })

        it('Eligibility Flows', { scrollBehavior: false }, () => {
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

    context('Publish Opportunity and Investment for Fund', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('Publish Accept Applications for Fund', { scrollBehavior: false }, () => {
            // Publish Investment
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnPublishOpportunityOption()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()
            // Publish Opportunity
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnPublishOpportunityOption()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()
            // Accept Applications
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnPublishOpportunityOption()
            pages.homeActions.clickOnPopupSubmitButton()
        })
        
        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Login Investor and Verify Fund', { scrollBehavior: false }, () => {
        
        before(() => {
            pages.generalActions.loginInvestorUser()
        })
    
        it('Verify Navigation and Fund Apply Link', () => {
            pages.investorHomeActions.verifyInvestorHomeUrl()
            pages.investorHomeActions.verifyHeaderTitleText()
            pages.investorHomeActions.clickOnApplyLink()
        })

        it('Fill Preview Form', { scrollBehavior: false }, () => {
            // fill first form
            pages.previewEligibilityFormActions.fillPreviewFormData(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill second form
            pages.previewEligibilityFormActions.fillAccreditedFormWithOption2()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill third form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()
            // upload fund template
            pages.previewEligibilityFormActions.uploadFundTemplate()
            pages.previewEligibilityFormActions.verifyFundTemplateUpload()
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill and verify equity form
            pages.previewEligibilityFormActions.verifyEquityInputAlert()
            pages.previewEligibilityFormActions.fillEquityFormData()
            pages.previewEligibilityFormActions.verifyEligibilityLimitCheckLink()
            pages.previewEligibilityFormActions.clickAndVerifyEquityAndLevergeValue()
            pages.previewEligibilityFormActions.clickOnNextButton()
            pages.previewEligibilityFormActions.clickOnMyApplicationButton()
        })
    
        after(() => {
            pages.investorHomeActions.logoutUser()
        });

    })
    
    context('Add Request Revision for Eligibility and Changes Requested', () => {

        before(() => {
            pages.generalActions.loginKnowledgeableAdminUser()
        })
        
        it('Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
    
        it('Click on First Element in My Tasks Table', { scrollBehavior: false }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        })

        it('Add Revisions Request for Triggered Flags', { scrollBehavior: false }, () => {
            pages.myTasksActions.clickOnFlagIcon()
            pages.myTasksActions.typeInCreateRequestsTextarea()
            pages.myTasksActions.clickOnSendButton()
            // After request submission, verify text and click Request Revisions Button
            pages.myTasksActions.verifyApproveButtonIsDisplayed()
            pages.myTasksActions.clickOnRequestRevisionsButton()
            pages.homeActions.clickOnCloseModalButton()
        })

        it('Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })

        it('Verify Changes Requested Label in Status', () => {
            pages.myTasksActions.verifyChangesRequestedLabelDisplayed()
        })
    
        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Login Investor and Resubmit Changes', { scrollBehavior: false }, () => {

        before(() => {
            pages.generalActions.loginInvestorUser()
        })
    
        it('Verify Navigation and Fund Apply Link', () => {
            pages.investorHomeActions.verifyInvestorHomeUrl()
            pages.investorHomeActions.verifyHeaderTitleText()
            pages.investorHomeActions.clickOnApplicationArrowButton()
        })

        it('Resubmit Changes from Investor', { scrollBehavior: false }, () => {
            pages.myApplicationActions.verifyEligibilityDecisionSpanIsPending()
            pages.myApplicationActions.verifyNewRequestButtonIsDisplayed()
            pages.myApplicationActions.verifyChangeRequestText()
            // Change Input Text
            pages.myApplicationActions.changeLastNameInput()
            pages.myApplicationActions.clickOnSubmitChangesButton()
            pages.myApplicationActions.clickOnModalCloseButton()
            pages.myApplicationActions.verifyUpdatedButtonIsDisplayed()
        })
    
        after(() => {
            pages.investorHomeActions.logoutUser()
        });

    })

    context('Add Request Revision for Eligibility and Changes Requested', () => {

        before(() => {
            pages.generalActions.loginKnowledgeableAdminUser()
        })
        
        it('Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })

        it('Verify Changes Requested Label in Status', () => {
            pages.myTasksActions.verifyPendingLabelDisplayed
        })
    
        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

})