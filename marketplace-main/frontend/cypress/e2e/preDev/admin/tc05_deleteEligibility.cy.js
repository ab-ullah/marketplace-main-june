import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

describe('TC05 Delete Eligibility Suite', () => {

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

    context('Create Eligibility', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })

        it('Click on Latest Fund from Funds Col', () => {
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
            pages.previewEligibilityFormActions.fillSubmitReviewFormForSecondCountry(data.eligibilityData.createEligibility.reviewer)
            pages.previewEligibilityFormActions.clickOnModalSendButton()
            pages.previewEligibilityFormActions.verifySubmitReviewSuccess()
            pages.previewEligibilityFormActions.closePopupModal()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Delete Eligibility', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })

        it('Click on Latest Fund from Funds Col', () => {
            pages.homeActions.clickOnFundInTheTable()
        })
    
        it('Open Eligibility Tab for the Fund', { scrollBehavior: false }, () => {
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
        })
        
        it('Delete Eligibility for the Fund', () => {
            pages.eligibilityCriteriaActions.clickOnActionsDotsButton()
            pages.eligibilityCriteriaActions.clickOnDeleteLink()
            pages.eligibilityCriteriaActions.clickOnModalSubmitButton()
            pages.eligibilityCriteriaActions.verifyEligibilityRecordIsDeleted()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })
    })
    
})