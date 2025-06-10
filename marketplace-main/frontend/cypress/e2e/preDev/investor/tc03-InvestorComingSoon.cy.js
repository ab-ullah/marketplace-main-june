/// <reference types= "cypress" />
import homeElements, * as elements from '../../../core/pageObjects/elements/general/homeElements'
import investorHomeElements from '../../../core/pageObjects/elements/general/investorHomeElements'
import investorHomeLabels from '../../../core/pageObjects/labels/general/investorHomeLabels'
import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

var getText;
describe('TS5: Create Fund Test Suite', () => {

    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('TC12: Create Fund Test', () => {
        pages.homeActions.clickOnCreateFundBtn()
        pages.createFundActions.fillCreateFundForm()
        pages.createFundActions.clickOnCreateButton()
    })

    it('TC13: Verify Fund Data and Save', {
        scrollBehavior: false
    }, () => {
        pages.createFundActions.verifyFundTitle()
        pages.createFundActions.verifyFundData()
        pages.createFundActions.scrollToSaveButton()
        pages.createFundActions.clickOnSaveButton()
    })

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})

describe('TS6: Eligibility Criteria Test', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('TC14: Click on Latest Fund from Funds Col', () => {

        //pages.homeActions.clickOnFundTitleInTheTable()
        pages.homeActions.clickLatestFund()
        pages.homeActions.getLatestFundID()
    });

    it('TC15: Eligibility Criteria Check For Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.eligibilityCriteriaActions.clickOnEligibilityTab()
        pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
        pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
        pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
    });

    it('TC16: Create Eligibility Form Page', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
        pages.createEligibilityFormActions.addTextInCommentBox()
        pages.createEligibilityFormActions.clickOnAddCommentButton()
        pages.createEligibilityFormActions.editFinalBlockInputs()
    });

    it('TC17: Add Blocks for US', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.clickOnAddBlocksButton()
        pages.createEligibilityFormActions.addUSAccreditedBlock()
        pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
        pages.createEligibilityFormActions.closeAddBlocksModal()
    });

    it('TC18: Fill Preview Form', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.clickOnPreviewButton()
        //Lables Updated
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

    it('TC19: Submit for Review', () => {
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

describe('TS7: Publish Funds After Approval of Eligibility', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('TC20: Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC21: Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('TC22: Approve the Assigned Task', {
        scrollBehavior: false
    }, () => {
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

    it('TC23: Publish Accept Applications for Fund', {
        scrollBehavior: false
    }, () => {
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
        cy.reload()
        pages.homeActions.clickOnActionsDotOptions()
        pages.homeActions.clickOnActionModalOptions()
        pages.homeActions.clickOnPopupSubmitButton()
        // Accept Applications
        cy.reload()
        //pages.homeActions.clickOnActionsDotOptions()
        //pages.homeActions.clickOnActionModalOptions()
        //pages.homeActions.clickOnPopupSubmitButton()

    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})

describe("TS8: Investor's - Find Fund and click on Apply Now Link ", () => {

    it("TC24: Apply Button-Find Same Fund and Only Perform one Click on Apply Button", () => {
        pages.generalActions.loginAdminUser()
        pages.generalActions.clickButtonUsingLocator(homeElements.firstfund).then(($vc) => {
            getText = $vc.text()
            cy.contains(getText).click()

            pages.homeActions.clickOnLogoutButton()
            pages.generalActions.loginInvestorUser()

            pages.generalActions.clickButtonUsingLocator(investorHomeElements.fundTableCellDiv).contains(getText).parents("div[role=row]").then(elem => {
                const parentRow = 'div[aria-rowindex="' + elem[0].ariaRowIndex + '"]'
                //pages.generalActions.getElementUsingLocator(parentRow).contains(labels.investorHomeLabels.applyNowLinkLabel).invoke('removeAttr', 'target').click()
                pages.generalActions.getElementUsingLocator(parentRow).should('not.contain', investorHomeLabels.applyNowLinkLabel)
                cy.reload()
                //pages.investorHomeActions.logoutUser()

            })
        })
    })

})