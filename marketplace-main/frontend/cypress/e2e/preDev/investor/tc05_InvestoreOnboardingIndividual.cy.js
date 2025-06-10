/// <reference types= "cypress" />
import homeElements, * as elements from '../../../core/pageObjects/elements/general/homeElements'
import investorHomeElements from '../../../core/pageObjects/elements/general/investorHomeElements'
import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

var getText;
describe('TS13: Create Fund Test Suite', () => {

    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('TC51: Create Fund Test', () => {
        pages.homeActions.clickOnCreateFundBtn()
        pages.createFundActions.fillCreateFundForm()
        pages.createFundActions.clickOnCreateButton()
    })

    it('TC52: Verify Fund Data and Save', {
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

describe('TS14: Eligibility Criteria Test', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('TC53: Click on Latest Fund from Funds Col', () => {

        //pages.homeActions.clickOnFundTitleInTheTable()
        pages.homeActions.clickLatestFund()
        pages.homeActions.getLatestFundID()
    });

    it('TC54: Eligibility Criteria Check For Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.eligibilityCriteriaActions.clickOnEligibilityTab()
        pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
        pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
        pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
    });

    it('TC55: Create Eligibility Form Page', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
        pages.createEligibilityFormActions.addTextInCommentBox()
        pages.createEligibilityFormActions.clickOnAddCommentButton()
        pages.createEligibilityFormActions.editFinalBlockInputs()
    });

    it('TC56: Add Blocks for US', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.clickOnAddBlocksButton()
        pages.createEligibilityFormActions.addUSAccreditedBlock()
        pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
        pages.createEligibilityFormActions.closeAddBlocksModal()
    });

    it('TC57: Fill Preview Form', {
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

    it('TC58: Submit for Review', () => {
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

describe('TS15: Publish Funds After Approval of Eligibility', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('TC59: Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC60: Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('TC61: Approve the Assigned Task', {
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

    it('TC62: Publish Accept Applications for Fund', {
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
        pages.homeActions.clickOnActionsDotOptions()
        pages.homeActions.clickOnActionModalOptions()
        pages.homeActions.clickOnPopupSubmitButton()

    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})

describe("TS16: Investor's - Find Fund and click on Apply Now Link ", () => {

    it("TC63: Apply Button-Find Same Fund and Only Perform one Click on Apply Button", () => {
        pages.generalActions.loginAdminUser()
        pages.generalActions.clickButtonUsingLocator(homeElements.firstfund).then(($vc) => {
            getText = $vc.text()
            cy.contains(getText).click()

            pages.homeActions.clickOnLogoutButton()
            pages.generalActions.loginInvestorUser()
            pages.generalActions.clickButtonUsingLocator(investorHomeElements.fundTableCellDiv).contains(getText).parents("div[role=row]").then(elem => {
                const parentRow = 'div[aria-rowindex="' + elem[0].ariaRowIndex + '"]'
                //pages.generalActions.getElementUsingLocator(parentRow).contains(labels.investorHomeLabels.applyNowLinkLabel).invoke('removeAttr', 'target').click()
                pages.generalActions.getElementUsingLocator(parentRow).contains('Apply Now').then(link => {
                    pages.generalActions.visitLink(link[0].dataset.applyLink)
                    cy.reload()
                    //pages.investorHomeActions.logoutUser()
                })
            })
        })

        //fill first form
        pages.previewEligibilityFormActions.fillPreviewFormData(data.eligibilityData.createEligibility.investment_country)
        pages.previewEligibilityFormActions.clickOnNextButton()
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
        //pages.previewEligibilityFormActions.verifyEligibilityLimitCheckLink()
        pages.previewEligibilityFormActions.clickAndVerifyEquityAndLevergeValue()
        pages.previewEligibilityFormActions.clickOnNextButton()
        pages.previewEligibilityFormActions.clickOnMyApplicationButton()
    })


    after(() => {
        pages.investorHomeActions.logoutUser()
    });

})

describe('TS17: Approval From Knowledgeable Admin', {
    scrollBehavior: false
}, () => {

    before(() => {
        pages.generalActions.loginKnowledgeableAdminUser()
    })

    it('TC65: Knw-Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC66: Knw-Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('TC67: -Knw-Approve the Assigned Task', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.addCommentInTextbox()
        pages.myTasksActions.clickOnAddCommentButton()
        pages.myTasksActions.clickOnRequestRevisionsButton()
        pages.myTasksActions.clickOnPopupCloseButton()
        pages.myTasksActions.clickOnApproveButton()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });

});

describe('TS18: Approval From Financial Admin', {
    scrollBehavior: false
}, () => {

    before(() => {
        pages.generalActions.loginFinancialUser()
    })

    it('TC68: Fin-Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC69: Fin-Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('TC70: Fin-Approve the Assigned Task', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.addCommentInTextbox()
        pages.myTasksActions.clickOnAddCommentButton()
        pages.myTasksActions.clickOnRequestRevisionsButton()
        pages.myTasksActions.clickOnPopupCloseButton()
        pages.myTasksActions.clickOnApproveButton()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });

});

describe('TS19: Admin Vehicle/ Master Class Selection', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('TC:71 Navitage to Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.homeActions.clickLatestFund()
        pages.createFundActions.verifyFundTitle()
    })

    it('TC:72 Navigate to Applicant Management Tab for the Fund', () => {
        pages.applicantManagementActions.clickOnApplicantManagementTab()
    })

    it('TC:73 Verify Header Title and Applicant Row', () => {
        pages.applicantManagementActions.verifyHeaderTitle()
        pages.applicantManagementActions.verifyApplicantRecordInTable()
    })
    it('TC:74 Click on Action Icon and View Option', () => {
        pages.applicantManagementActions.clickOnActionsDotIcon()
        pages.applicantManagementActions.clickOnEditSubActionLink()
    })
    it('TC:75 Select Vehicle Option', () => {
        pages.applicantManagementActions.selectVehicleOption()
    })
    it('TC:76 Select Share Class Option', () => {

        pages.applicantManagementActions.selectShareClassOption()
    })
    it('TC:77 Save the Edit Changes', () => {
        pages.applicantManagementActions.clickOnSaveButton()
    })

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})

describe('TS20: Admin Approval of Fund', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })
    it('TC:78 Navitage to Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.homeActions.clickLatestFund()
        pages.createFundActions.verifyFundTitle()
    })

    it('TC:79 Navigate to Applicant Management Tab for the Fund', () => {
        pages.applicantManagementActions.clickOnApplicantManagementTab()
    })
    it('TC:80 Click on Action Icon and Approve', () => {
        pages.applicantManagementActions.clickOnActionsDotIcon()
        pages.applicantManagementActions.clickOnApproveSubActionLink()
    })
    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})
describe.skip("TS25: Investor-KYC/ AML Process ", () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    before(() => {
        pages.generalActions.loginInvestorUser()
    })

    it("TC81: Verify Welcome Text & Investor URL", () => {
        pages.investorHomeActions.verifyInvestorHomeUrl()
        pages.investorHomeActions.verifyWelcomeHeaderTitle()
    })
    it("TC81: Navigate to Latest Funds On Tile", () => {
        pages.investorHomeActions.clickOnapplicationinprogress1st()
    })
    it("TC82: Navigate to KYC/ AML", () => {
        pages.myApplicationActions.continueyourApplication()
    })
    it("TC83: Verification of Personal Information", () => {
        pages.kycAmlActions.verifyKYCHeaderTitle()
        pages.kycAmlActions.verifykycHeaderPersonalInformation()

        //Verify Personal Information Form
        pages.kycAmlActions.verifyKYCPersonalInformation()

        //Verify  Personal Information Form Labels
        pages.kycAmlActions.verifyKYCPersonalInformationLabels()

        //Click on Next Button
        pages.kycAmlActions.kycNextButtonOnPersonalInformation()


    })
    it("TC84: Verification of Home Address", () => {
        //Verify Home Address
        pages.kycAmlActions.verifykycHeaderHomeAddress()
        pages.kycAmlActions.verifyKYCHomeAddress()
        pages.kycAmlActions.verifyKYCHomeAddressLabels()
        pages.kycAmlActions.clickOnNextButtonHomeAddress()

    })
    it("TC85: Verification of Upload Documnet", () => {
        //Verify Upload Document
        pages.kycAmlActions.verifyKYCHeaderTitle()
        pages.kycAmlActions.clickToUploadFile()
        pages.kycAmlActions.verifyUploadDocumentForm()
        //Upload File
        pages.kycAmlActions.UploadFileIDdocumentImage()
        //File Verification
        pages.kycAmlActions.verifyKYCUploadDocumnet()
        pages.kycAmlActions.verifyBackButton()
        //Click 
        cy.get('.sc-cjzNjn').click()


    })
    after(() => {
        pages.investorHomeActions.logoutUser()
    })

})
describe.skip('TS26: KYC/AML Approval From Financial Admin', {
    scrollBehavior: false
}, () => {

    before(() => {
        pages.generalActions.loginFinancialUser()
    })

    it('TC86: Fin-Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC87: Fin-Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('88: Fin-Approve the Assigned Task', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.addCommentInTextbox()
        pages.myTasksActions.clickOnAddCommentButton()
        pages.myTasksActions.clickOnRequestRevisionsButton()
        pages.myTasksActions.clickOnPopupCloseButton()
        pages.myTasksActions.clickOnApproveButton()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });

});
describe.skip("TS27: Investor Tax Form ", () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from
        // failing the test
        return false
    })
    before(() => {
        pages.generalActions.loginInvestorUser()
    })

    it("TC89: Verify Welcome Text & Investor URL", () => {
        pages.investorHomeActions.verifyInvestorHomeUrl()
        pages.investorHomeActions.verifyWelcomeHeaderTitle()
    })
    it("TC90: Navigate to Latest Funds On Tile", () => {
        pages.investorHomeActions.clickOnapplicationinprogress1st()
    })
    it("TC91: Navigate to KYC/ AML", () => {
        pages.myApplicationActions.continueyourApplication()
        cy.wait(3000)
    })
    it.skip("TC92: Navigate to Tax Form 1st Form - Country", () => {
        //1st Tax Form-Country 
        pages.myTaxFormActions.verifyHeaderTileTaxForm()
        pages.myTaxFormActions.verifyCountryHeading()
        pages.myTaxFormActions.verifyCountryDescription()
        pages.myTaxFormActions.verifyCountryInput()
        pages.myTaxFormActions.clickonNextButtonsecondForm()

    })
    it.skip("TC93: Navigate to Tax Form 2nd Form", () => {
        //2nd Tax Form
        pages.myTaxFormActions.verifyBackButton()
        pages.myTaxFormActions.verifySecondTaxForm()
        //2nd Tax Form - Labels Verification
        pages.myTaxFormActions.verifySecondTaxFormLabels()
        pages.myTaxFormActions.clickonNextButtonsecondForm()
    })
    it("TC94: Navigate to Investor Tax Forms", () => {
        //3nd Tax Form
        pages.myTaxFormActions.verifyBackButton()
        pages.myTaxFormActions.investorTaxFormTable()
        pages.myTaxFormActions.verifyInputCheckboxes()
        pages.myTaxFormActions.vefiytableHeader()
        //cy.get('.MuiTableHead-root > .MuiTableRow-root > :nth-child(1)').should("be.visible").should("have.text", "Selection")

    })


    after(() => {
        //pages.investorHomeActions.logoutUser()
    })

})