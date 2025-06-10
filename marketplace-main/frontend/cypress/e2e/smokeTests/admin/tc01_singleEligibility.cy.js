import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

describe('TC01 Single Eligibility Criteria Test', () => {

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

        it('C1239: Verify create Eligibility Criteria for an existing fund for a single country', {
            scrollBehavior: false
        }, () => {
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

        it('C1241: Verify configuration of Eligibility form for the United States', {
            scrollBehavior: false
        }, () => {
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

        it('C1244: Verify Admin sends form for review', {
            scrollBehavior: false
        }, () => {
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

        it('C1245: Verify Admin publishes all the eligibility forms', {
            scrollBehavior: false
        }, () => {
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

        it('C1249: Verify Admin approves all eligibility flows', {
            scrollBehavior: false
        }, () => {
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

        it('C1250: Verify Admin publishes the investment', {
            scrollBehavior: false
        }, () => {
            // Publish Investment
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()
        })

        it('C1246: Verify Admin publishes the opportunity', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
            pages.generalActions.pageReload()
        })

        it('C1247: Verify Admin accepts the applications', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

})



describe('TS01: Create Fund Test Suite & Upload Funds Document', () => {


    before(() => {
        pages.generalActions.LoginForAdmin()
    })

    it('C5085: Create Fund Test', () => {
        pages.homeActions.clickOnCreateFundBtn()
        pages.createFundActions.fillCreateFundForm()
        pages.createFundActions.clickOnCreateButton()
    })

    it('TC2: Verify Fund Data and Save', {
        scrollBehavior: false
    }, () => {
        pages.createFundActions.verifyFundTitle()
        pages.createFundActions.verifyFundData()
        pages.createFundActions.scrollToSaveButton()
        pages.createFundActions.clickOnSaveButton()
        pages.createFundActions.redirectToHomepage()

    })
    it('Click on Edit Fund Document Link', () => {
        pages.homeActions.clickOnEditFundDocumentLink()
    })

    it('Verify Modal Title and Upload File', () => {
        pages.homeActions.verifyModalTitleIsDisplayed()
        pages.homeActions.uploadDocsCE()
        pages.homeActions.verifyFundTemplateUpload()
        pages.homeActions.clickOnCloseModalButton()
    })


    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})

describe.only('TS02: Eligibility Criteria Test', () => {

    before(() => {
        pages.generalActions.LoginForAdmin()
    })

    it('TC3: Click on Latest Fund from Funds Col', () => {

        //pages.homeActions.clickOnFundTitleInTheTable()
        pages.homeActions.clickLatestFund()
        pages.homeActions.getLatestFundID()
    });

    it('TC4: Eligibility Criteria Check For Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.eligibilityCriteriaActions.clickOnEligibilityTab()
        pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
        pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
        pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
    });

    it('TC5: Create Eligibility Form Page', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
        pages.createEligibilityFormActions.addTextInCommentBox()
        pages.createEligibilityFormActions.clickOnAddCommentButton()
        pages.createEligibilityFormActions.editFinalBlockInputs()
    });

    it('TC6: Add Blocks for US', {
        scrollBehavior: false
    }, () => {
        pages.createEligibilityFormActions.clickOnAddBlocksButton()
        pages.createEligibilityFormActions.addUSAccreditedBlock()
        pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
        pages.createEligibilityFormActions.closeAddBlocksModal()
    });

    it('TC7: Fill Preview Form', {
        scrollBehavior: false
    }, () => {
        cy.reload()
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

    it('TC8: Submit for Review', () => {
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

describe('TS03: Publish Funds After Approval of Eligibility', () => {

    before(() => {
        pages.generalActions.LoginForAdmin()
    })

    it('TC9: Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC10: Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('TC11: Approve the Assigned Task', {
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

    it('TC12: Publish Accept Applications for Fund', {
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

describe("TS04: Investor's - Find Fund and click on Apply Now Link ", () => {

    it("TC13: Apply Button-Find Same Fund and Only Perform one Click on Apply Button", () => {
        pages.generalActions.LoginForAdmin()
        pages.generalActions.clickButtonUsingLocator(homeElements.firstfund).then(($vc) => {
            getText = $vc.text()
            cy.contains(getText).click()

            pages.homeActions.clickOnLogoutButton()
            pages.generalActions.LoginForInvestor()
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

describe('TS05: Approval From Knowledgeable Admin', {
    scrollBehavior: false
}, () => {

    before(() => {
        pages.generalActions.loginKnowledgeableAdminUser()
    })

    it('TC14: Knw-Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC15: Knw-Click on First Element in My Tasks Table', {
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

describe('TS06: Approval From Financial Admin', {
    scrollBehavior: false
}, () => {

    before(() => {
        pages.generalActions.loginFinancialUser()
    })

    it('TC18: Fin-Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC19: Fin-Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('TC20: Fin-Approve the Assigned Task', {
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

describe('TS07: Admin Vehicle/ Master Class Selection', () => {

    before(() => {
        pages.generalActions.LoginForAdmin()
    })

    it('TC:21 Navitage to Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.homeActions.clickLatestFund()
        pages.createFundActions.verifyFundTitle()
    })

    it('TC:22 Navigate to Applicant Management Tab for the Fund', () => {
        pages.applicantManagementActions.clickOnApplicantManagementTab()
    })

    it('TC:23 Verify Header Title and Applicant Row', () => {
        pages.applicantManagementActions.verifyHeaderTitle()
        pages.applicantManagementActions.verifyApplicantRecordInTable()
    })
    it('TC:24 Click on Action Icon and View Option', () => {
        pages.applicantManagementActions.clickOnActionsDotIcon()
        pages.applicantManagementActions.clickOnEditSubActionLink()
    })
    it('TC:25 Select Vehicle Option', () => {
        pages.applicantManagementActions.selectVehicleOption()
    })
    it('TC:26 Select Share Class Option', () => {

        pages.applicantManagementActions.selectShareClassOption()
    })
    it('TC:27 Save the Edit Changes', () => {
        pages.applicantManagementActions.clickOnSaveButton()
    })

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})

describe('TS08: Admin Approval of Fund', () => {

    before(() => {
        pages.generalActions.LoginForAdmin()
    })
    it('TC:28 Navitage to Latest Fund', {
        scrollBehavior: false
    }, () => {
        pages.homeActions.clickLatestFund()
        pages.createFundActions.verifyFundTitle()
    })

    it('TC:29 Navigate to Applicant Management Tab for the Fund', () => {
        pages.applicantManagementActions.clickOnApplicantManagementTab()
    })
    it('TC:30 Click on Action Icon and Approve', () => {
        pages.applicantManagementActions.clickOnActionsDotIcon()
        pages.applicantManagementActions.clickOnApproveSubActionLink()
    })
    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})

describe("TS09: Investor-KYC/ AML Process ", () => {

    before(() => {
        pages.generalActions.LoginForInvestor()
    })

    it("TC31: Verify Welcome Text & Investor URL", () => {
        pages.investorHomeActions.verifyInvestorHomeUrl()
        pages.investorHomeActions.verifyWelcomeHeaderTitle()
    })
    it("TC32: Navigate to Latest Funds On Tile", () => {
        pages.investorHomeActions.clickOnapplicationinprogress1st()
    })
    it("TC33: Navigate to KYC/ AML", () => {
        pages.myApplicationActions.continueyourApplication()

    })
    it("TC34: Input Corporate Entries of Personal Information", () => {
        pages.kycAmlActions.verifyKYCHeaderTitle()
        pages.kycAmlActions.fillCEKYCPersonalInformation()
        pages.kycAmlActions.verifykycHeaderPersonalInformation()
        pages.kycAmlActions.kycNextPageRedirectionSingle()


    })
    it("TC35: Input of Home Address", () => {
        pages.kycAmlActions.verifykycHeaderHomeAddress()
        pages.kycAmlActions.inputKYCHomeAddress()
        cy.get('.sc-kHVIJG').click()
        pages.kycAmlActions.kycNextPageRedirectionSingle()

    })
    it("TC36: Input of Upload Documnet", () => {

        pages.kycAmlActions.verifyKYCHeaderTitle()
        pages.kycAmlActions.inputUploadDocumentForm()
        pages.kycAmlActions.UploadFileIDdocumentImage()
        pages.kycAmlActions.uploadFileProofCE()
        pages.kycAmlActions.kycProofDocumnetDelete()
        pages.kycAmlActions.kycNextPageRedirectionSingle()

    })
    it("TC37: Corporate Entity", () => {
        //Verify Upload Document
        pages.kycAmlActions.verifyBackButton()
        pages.kycAmlActions.verifyKYCHeaderTitle()
        pages.kycAmlActions.fillCEKYCCorporateEntity()
        cy.get('.sc-kHVIJG').click()
        pages.kycAmlActions.kycNextPageRedirectionSingle()


    })
    it("TC38: Participant Information", () => {
        pages.kycAmlActions.verifyKYCHeaderTitle()
        //skipped due to add more issue
        //pages.kycAmlActions.fillCEKYCParticipantInformation()
        pages.kycAmlActions.kycNextPageRedirectionSingle()

    })

    it("TC39: Corporate Documents-Upload", () => {
        pages.kycAmlActions.fillCEKYCCorporateDocumnet()
        pages.kycAmlActions.entityNameInputTaxForm()
        pages.kycAmlActions.kycCorporateDocumnetDelete()
        pages.kycAmlActions.kycNextPageRedirectionSingle()
        pages.generalActions.waitToLoadElement()

    })

    it.skip("TC40: Navigate to Personal information", () => {
        pages.kycAmlActions.kycNextPageRedirection()
        pages.generalActions.pageReload()
    })


    after(() => {
        pages.investorHomeActions.logoutUser()
    })

})

describe('TS10: KYC/AML Approval From Financial Admin', {
    scrollBehavior: false
}, () => {

    before(() => {
        pages.generalActions.loginFinancialUser()
    })

    it('TC40: Fin-Navigate to My Tasks', () => {
        pages.homeActions.clickOnMyTasksButton()
    })

    it('TC41: Fin-Click on First Element in My Tasks Table', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.clickOnFirstEligibilityInTable()
    });

    it('TC42: Fin-Approve the Assigned Task', {
        scrollBehavior: false
    }, () => {
        pages.myTasksActions.addCommentInTextbox()
        pages.kycAmlActions.selectRiskValueRating()
        pages.myTasksActions.clickOnAddCommentButton()
        pages.myTasksActions.clickOnRequestRevisionsButton()
        pages.myTasksActions.clickOnPopupCloseButton()
        pages.myTasksActions.clickOnApproveButton()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });

});

describe("TS11: Investor Tax Form-New Investor ", () => {

    before(() => {
        pages.generalActions.LoginForInvestor()
    })

    it("C5085: Verify Welcome Text & Investor URL", () => {
        pages.investorHomeActions.verifyInvestorHomeUrl()
        pages.investorHomeActions.verifyWelcomeHeaderTitle()
    })
    it("TC44: Navigate to Latest Funds On Tile", () => {
        pages.investorHomeActions.clickOnapplicationinprogress1st()
    })
    it("TC45: Navigate to KYC/ AML", () => {
        pages.myApplicationActions.continueyourApplication()
        cy.wait(3000)
    })
    it("TC46: Tax Form-1st (Country)", {
        scrollBehavior: false
    }, () => {
        //1st Tax Form-Country
        pages.myTaxFormActions.verifyHeaderTileTaxForm()
        pages.myTaxFormActions.verifyCountryHeading()
        pages.myTaxFormActions.verifyCountryDescription()
        pages.myTaxFormActions.verifyCountryInput()
        pages.myTaxFormActions.clickonNextButtonsecondForm()

    })
    it("TC47: Tax Form-2nd Radio Button", () => {
        pages.myTaxFormActions.verifyBackButton()
        pages.myTaxFormActions.verifySecondTaxForm()
        pages.myTaxFormActions.verifySecondTaxFormLabels()
        pages.myTaxFormActions.clickonNextButtonsecondForm()
    })

    it("TC48: Tax Form-3rd Form Selection", () => {
        pages.myTaxFormActions.verifyBackButton()
        pages.myTaxFormActions.investorTaxFormTable()
        pages.myTaxFormActions.verifyInputCheckboxes()
        pages.myTaxFormActions.vefiytableHeader()
        pages.kycAmlActions.ScrollBottom()
        pages.myTaxFormActions.selectTaxFormW9Form()
        pages.myTaxFormActions.clickOnNextButtonTaxFormSinglepage()
    })
    it("TC49: Tax Form-4th Self Certificate", () => {

        pages.myTaxFormActions.checkIndividualCertificate()
        pages.myTaxFormActions.clickOnNextButtonTaxFormSinglepage()
    })
    it("TC50:5th Form Documnet and Replace Document", () => {
        pages.myTaxFormActions.verifyGotoapplicationLink()
        pages.myTaxFormActions.clickOnDeleteicon()
        pages.myTaxFormActions.clickOnChangeFormButton()
        pages.myTaxFormActions.selectTaxFormW9Form()
        pages.myTaxFormActions.selectTBBENForm()
        pages.myTaxFormActions.clickOnNextButtonTaxFormSinglepage()
        pages.myTaxFormActions.checkIndividualCertificate()
        pages.myTaxFormActions.clickOnNextButtonTaxFormSinglepage()
        pages.myTaxFormActions.clickOnNextButtonTaxFormSinglepage()

    })
    it("TC51: Bank Detail Form-Location", () => {
        pages.myBankDetailActions.selectBankLocation()
        pages.myBankDetailActions.bankDetailForm()
        pages.myBankDetailActions.bankDetailSubmitButton()

    })
    it("TC52: Program Document", () => {
        pages.myBankDetailActions.clickonPreviewModal()
        //pages.myBankDetailActions.clickonModalDownloadButton()
        pages.myBankDetailActions.clickonModalCloseButton()
        pages.myBankDetailActions.clickonDownloadIcon()
        pages.myBankDetailActions.selectiObjectAgreement()
        //pages.myBankDetailActions.clickONextButton()
        cy.get('.sc-geBCVM').click()

    })
    it.skip("TC53: Review Document", () => {
        pages.myBankDetailActions.verifyTextOnReviewDocumentPage()
        pages.myBankDetailActions.verifyDocumentPreviewModal()
        pages.myBankDetailActions.clickOModalCloseButton()
        //
        pages.myBankDetailActions.verifyNextButtonDisabled()
        pages.myBankDetailActions.checkagreementCheckBox()
        pages.myBankDetailActions.clickOModalCloseButton()
        pages.myBankDetailActions.clickOnNextButtonReviewDocument()

        //Last Page
        pages.myBankDetailActions.verifygoToMYApplication()

    })

    after(() => {
        pages.investorHomeActions.logoutUser()
    })

})

describe("TS12: Investor Tax Form-New Investor ", () => {

    before(() => {
        pages.generalActions.LoginForInvestor()
    })

    it("TC70: Verify Welcome Text & Investor URL", () => {
        pages.investorHomeActions.verifyInvestorHomeUrl()
        pages.investorHomeActions.verifyWelcomeHeaderTitle()
    })
    it("TC71: Navigate to Latest Funds On Tile", () => {
        pages.investorHomeActions.clickOnapplicationinprogress1st()
    })
    it("TC72: Investor Information", () => {







    })



    after(() => {
        //pages.investorHomeActions.logoutUser()
    })


})