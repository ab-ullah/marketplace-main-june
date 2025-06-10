import * as pages from '../../../core/pageObjects/pages'
import data from '../../../fixtures/fundsData'

describe('TC02 Multiple Eligibility Criteria at Investors End', () => {

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

    context('Create Eligibility For US', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })

        it('Click on Latest Fund from Funds Col', () => {
            pages.homeActions.clickOnFundTitleInTheTable()
        })
    
        it('Eligibility Criteria Check For Latest Fund', { scrollBehavior: false }, () => {
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fund_data.country)
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
        })
    
        it('Create Eligibility Form Page', { scrollBehavior: false }, () => {
            pages.createEligibilityFormActions.verifyHeaderTitle(data.createEligibility.investment_country)
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
            pages.previewEligibilityFormActions.fillPreviewFormData(data.createEligibility.investment_country)
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

        it('Click on Latest Fund from Funds Col', () => {
            pages.homeActions.clickOnFundTitleInTheTable()
        })
    
        it('Eligibility Criteria Check For Latest Fund', { scrollBehavior: false }, () => {
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fund_data.second_country)
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
        })
    
        it('Create Eligibility Form Page', { scrollBehavior: false }, () => {
            pages.createEligibilityFormActions.verifyHeaderTitle(data.createEligibility.sec_investment_country)
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
            pages.previewEligibilityFormActions.fillPreviewFormData(data.createEligibility.sec_investment_country)
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

    context('Approve and Publish Fund', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })
    
        it('Publish Accept Applications for Fund', { scrollBehavior: false }, () => {
            // Publish Investment
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()
            // Publish Opportunity
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()
            // Accept Applications
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.waitForTime(5000)
        })
        
        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Login Investor and Click Apply Fund Link', { scrollBehavior: false }, () => {
        
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
            pages.previewEligibilityFormActions.fillPreviewFormData(data.createEligibility.investment_country)
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
            pages.previewEligibilityFormActions.clickOnNextButton()
            pages.previewEligibilityFormActions.clickOnMyApplicationButton()
        })

        it('Check and Modify My Applications Page', { scrollBehavior: false }, () => {
            pages.myApplicationActions.verifyTitleHeader()
            pages.myApplicationActions.verifyFundTitle()        
        })

        it('Modify Invest Country to Japan and Verify', { scrollBehavior: false }, () => {
            pages.myApplicationActions.modifyInvestCountryValue(data.fund_data.second_country)
            pages.myApplicationActions.clickOnModalYesButton()
            pages.generalActions.waitForTime(3000)
            // First Form
            pages.previewEligibilityFormActions.clickOnNextButton()
            // Next forms - Accredited
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
            pages.previewEligibilityFormActions.clickOnNextButton()
            pages.previewEligibilityFormActions.clickOnMyApplicationButton()
        })

        it('Check and Modify My Applications Page', { scrollBehavior: false }, () => {
            pages.myApplicationActions.verifyTitleHeader()
            pages.myApplicationActions.verifyFundTitle()        
        })
    
        after(() => {
            pages.investorHomeActions.logoutUser()
        })

    })

})