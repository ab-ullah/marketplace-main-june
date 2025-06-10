import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

describe('TC02 Eligibility Criteria Test', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('Click on Latest Fund from Funds Col', () => {
        pages.homeActions.clickOnFundTitleInTheTable()
    });

    it('Eligibility Criteria Check For Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.eligibilityCriteriaActions.clickOnEligibilityTab()
        pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
        pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
        pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
    });

    it('Create Eligibility Form Page', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
        pages.createEligibilityFormActions.addTextInCommentBox()
        pages.createEligibilityFormActions.clickOnAddCommentButton()
        pages.createEligibilityFormActions.editFinalBlockInputs()
    });

    it('Add Blocks for US', {
        scrollBehavior: true
    }, () => {
        pages.createEligibilityFormActions.clickOnAddBlocksButton()
        pages.createEligibilityFormActions.addUSAccreditedBlock()
        pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
        pages.createEligibilityFormActions.closeAddBlocksModal()
    });

    it('Fill Preview Form', {
        scrollBehavior: false
    }, () => {
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
    });

    it('Submit for Review', () => {
        pages.previewEligibilityFormActions.clickOnSubmitReviewButton()
        pages.previewEligibilityFormActions.fillSubmitReviewForm(data.eligibilityData.createEligibility.reviewer)
        pages.previewEligibilityFormActions.clickOnModalSendButton()
        pages.previewEligibilityFormActions.verifySubmitReviewSuccess()
        pages.previewEligibilityFormActions.closePopupModal()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})