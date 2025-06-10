/// <reference types= "cypress" />
import homeElements, * as elements from '../../../core/pageObjects/elements/general/homeElements'
import investorHomeElements from '../../../core/pageObjects/elements/general/investorHomeElements'
import {
    marketplaceElements
} from '../../../core/pageObjects/elements'
import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

var getText;
describe('Create Fund/ Eligibility Criteria/ Approval of Eligibility', () => {

    context.only('TC01 Create Fund/ Eligibility Criteria/ Approval of Eligibility', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C5635: Create Fund Test Invite Only Case', () => {
            cy.wait(100000)
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.uploadFundTemplateInvite()
            pages.createFundActions.clickOnCreateButton()
        })
        it('C5636: Verify Fund Data and Save', {
            scrollBehavior: false
        }, () => {

            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.redirectToHomepage()

        })
        it('C5637: Click on Edit Fund Document Link to Upload File', () => {

            pages.homeActions.clickOnEditFundDocumentLink()
        })
        it('C5638: Verify Modal Title and Upload File', () => {
            pages.homeActions.verifyModalTitleIsDisplayed()
            pages.homeActions.uploadDocsCE()
            pages.homeActions.checkRequiredSignature()
            pages.homeActions.uploadDocsRequiredSignature()
            pages.homeActions.verifyFundDocumnetUpload()
            pages.homeActions.clickOnCloseModalButton()
            pages.createFundActions.redirectToHomepage()
        })
        it('C5639: Eligibility Criteria-Click on Latest Fund from Funds Col', () => {

            //pages.homeActions.clickOnFundTitleInTheTable()
            pages.homeActions.clickLatestFund()
            pages.homeActions.getLatestFundID()
        });
        it('C5640: Eligibility Criteria-Check For Latest Fund', {
            scrollBehavior: false
        }, () => {
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
        });
        it('C5641: Create Eligibility Form Page', {
            scrollBehavior: false
        }, () => {
            pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
            pages.createEligibilityFormActions.addTextInCommentBox()
            pages.createEligibilityFormActions.clickOnAddCommentButton()
            pages.createEligibilityFormActions.editFinalBlockInputs()
        });
        it('C5642: Eligibility Criteria-Add Blocks for US', {
            scrollBehavior: false
        }, () => {
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.createEligibilityFormActions.addUSAccreditedBlock()
            pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
            pages.createEligibilityFormActions.closeAddBlocksModal()
        });
        it('C5643: Eligibility Criteria-Fill Preview Form', {
            scrollBehavior: false
        }, () => {
            pages.createEligibilityFormActions.clickOnPreviewButton()
            //Lables Updated
            //pages.previewEligibilityFormActions.clickOnStartButton()
            // fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill second form
            pages.previewEligibilityFormActions.fillAccreditedForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill third form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()
        });
        it('C5644: Submit for Review', () => {
            pages.previewEligibilityFormActions.clickOnSubmitReviewButton()
            pages.previewEligibilityFormActions.fillSubmitReviewForm(data.eligibilityData.createEligibility.reviewer)
            pages.previewEligibilityFormActions.clickOnModalSendButton()
            pages.previewEligibilityFormActions.verifySubmitReviewSuccess()
            pages.previewEligibilityFormActions.closePopupModal()
            pages.createFundActions.redirectToHomepage()
        });
        it('C5645: Approval of Eligibility-Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('C5646: Approval of Eligibility-Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        });
        it('C5647: Approval of Eligibility-Approve the Assigned Task', {
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
            pages.generalActions.pageReload()
        });
        it('C5648: Approval of Eligibility-Publish Accept Applications for Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnFundsLinkInHeader()

            // Make Eligibility Flow Ready
            pages.generalActions.waitForTime(5000)
            pages.homeActions.clickOnFundInTheTable()
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnEligibilityFlowsButton()

            // Navigate to Funds Page
            pages.homeActions.clickOnFundsLinkInHeader()

            // Publish Investment
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()

            // Publish Opportunity
            pages.generalActions.pageReload()
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()

            // Accept Applications
            pages.generalActions.pageReload()
            pages.homeActions.clickOnActionsDotOptions()
            pages.homeActions.clickOnActionModalOptions()
            pages.homeActions.clickOnPopupSubmitButton()

        });

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        });
    });

    context("TC02 Investor's - Find Fund and click on Apply Now Link", {
        scrollBehavior: false
    }, () => {

        it("Apply Button-Find Same Fund and Only Perform one Click on Apply Button", () => {
            pages.generalActions.conditionalLoginForAdmin()

            pages.generalActions.clickButtonUsingLocator(homeElements.firstfund).then(($vc) => {
                getText = $vc.text()
                cy.contains(getText).click()
                pages.homeActions.clickOnLogoutButton()

                pages.generalActions.conditionalLoginForMarketPlaceInvestor()
                pages.marketplaceActions.marketplaceHomepageConditionsAll()
                cy.get(marketplaceElements.parentTile)
                    .contains(getText)
                    .parent(marketplaceElements.textParent)
                    .parent(marketplaceElements.textParentSection)
                    .children(marketplaceElements.buttonsParent)
                    .children(marketplaceElements.ApplyNowParent)
                    .children(marketplaceElements.clickonApplyNowLink)
                    .click({
                        force: true
                    })

            })

        })
        it("Fill Investor Information Form-1st Form", {
            scrollBehavior: false
        }, () => {
            pages.marketplaceActions.fillInvestorInformationForm()

        })
        it("Fill Investor Information Form-Second Form", {
            scrollBehavior: false
        }, () => {
            pages.marketplaceActions.fillmarketplaceSecondForm()
            // cy.get('input[type="radio"][value="us.ai.1"]').check()
            // cy.get('input[type="checkbox"]').check()
            // pages.generalActions.scrollToBottom()
            // cy.contains("Next").click()


        })
        it("Fill Investor Information Form-Third Form(Knowledgeable)", {
            scrollBehavior: false
        }, () => {
            pages.marketplaceActions.fillmarketplaceThirdForm()
            // pages.generalActions.waitForTime(2000)
            // cy.get(':nth-child(1) > .MuiButtonBase-root > .PrivateSwitchBase-input').check()
            // pages.generalActions.scrollToBottom()
            // cy.contains("Next").click()


        })
        it("Fill Investor Information Form-Fourth Form(Equity)", {
            scrollBehavior: false
        }, () => {
            pages.marketplaceActions.fillmarketplaceForthFormandVerification()
            // cy.get('#amount').clear().type('10000')
            // cy.get(':nth-child(1) > .MuiButtonBase-root > .PrivateSwitchBase-input').check()
            // pages.generalActions.scrollToBottom()
            // cy.contains("Submit").click()

            // cy.get('h1').should('have.text', 'Thankyou! Review text for test automation.')
            // cy.contains("See all funds").click()
        })


        after(() => {
            pages.marketplaceActions.marketplacelogout()
        });
    });

    context('TC03 Eligibility Decision KnowledgeableAdmin - Approval', () => {

        before(() => {
            pages.generalActions.conditionalLoginKnowledgeableAdminUser()
        })

        it('C5650: Knw-Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('C5651: Knw-Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()

        })
        it('C5654: Knw-Request Revision Completion-Approval', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnRevisionApprove()

        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        });

    });

    context('TC04 Eligibility Decision FinancialAdmin - Approval', () => {

        before(() => {
            pages.generalActions.conditionalLoginFinancialUser()
        })
        it('C5655: Fin-Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('C5656: Fin-Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        });
        it('C5659: Fin-Request Revision Completion-Approval', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnRevisionApprove()

        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        });

    })

    context('TC05 Admin-Vehicle/ Master Class Selection/ Approval', () => {


        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C5660: Master Class Selection-Navigate to Latest Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickLatestFund()
            pages.createFundActions.verifyFundTitle()
        })
        it('C5661: Master Class Selection-Navigate to Applicant Management Tab for the Fund', () => {
            pages.generalActions.pageReload()
            pages.applicantManagementActions.clickOnApplicantManagementTab()
        })
        it('C5662: Master Class Selection-Verify Header Title and Applicant Row', () => {
            pages.applicantManagementActions.verifyHeaderTitle()
            pages.applicantManagementActions.verifyApplicantRecordInTable()
        })
        it('C5663: Master Class Selection-Click on Action Icon and View Option', () => {
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.applicantManagementActions.clickOnEditSubActionbeforeApproval()
        })
        it('C5664: Select Vehicle Option', () => {
            pages.applicantManagementActions.selectVehicleOption()
        })
        it('C5665: Select Share Class Option', () => {

            pages.applicantManagementActions.selectShareClassOption()
        })
        it('C5666: Save the Edit Changes', () => {
            pages.applicantManagementActions.clickOnEditApplicantSaveButton()
        })
        it('C5667: Admin Approval of Fund-Navigate to Latest Fund', {
            scrollBehavior: false
        }, () => {
            pages.createFundActions.redirectToHomepage()
            pages.homeActions.clickLatestFund()
            pages.createFundActions.verifyFundTitle()
        })
        it('C5668: Admin Approval of Fund-Navigate to Applicant Management Tab for the Fund', () => {
            pages.applicantManagementActions.clickOnApplicantManagementTab()
        })
        it('C5669: Click on Action Icon and Approve', () => {
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.generalActions.waitForTime(2000)
            pages.applicantManagementActions.clickOnApproveSubActionLink()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        });

    });



    //-----



    context('TC06 Investor-KYC/ AML Process', () => {

        before(() => {
            pages.generalActions.conditionalLoginForInvestor()
        })

        it("C5670: Investor-Verify Welcome Text & Investor URL", () => {
            pages.investorHomeActions.verifyInvestorHomeUrl()
            pages.investorHomeActions.verifyWelcomeHeaderTitle()
        })
        it("C5671: Investor-Navigate to Latest Funds On Tile", () => {
            pages.investorHomeActions.clickOnapplicationinprogress1st()
        })
        it("C5672: Investor-Navigate to KYC/ AML", () => {
            pages.generalActions.waitForTime(3000)
            pages.myApplicationActions.continueyourApplication()

        })
        it("C5673: Input Corporate Entries of Personal Information", () => {
            pages.kycAmlActions.verifyKYCHeaderTitle()
            pages.kycAmlActions.fillCEKYCPersonalInformation()
            pages.kycAmlActions.verifykycHeaderPersonalInformation()
            pages.kycAmlActions.kycNextPageRedirectionSingle()


        })
        it("C5674: Input of Home Address", () => {
            pages.kycAmlActions.verifykycHeaderHomeAddress()
            pages.kycAmlActions.inputKYCHomeAddress()
            pages.kycAmlActions.clickOnNextStepButton()
            pages.kycAmlActions.kycNextPageRedirectionSingle()

        })
        it("C5675: Input of Upload Document", () => {

            pages.kycAmlActions.verifyKYCHeaderTitle()
            pages.kycAmlActions.inputUploadDocumentForm()
            pages.kycAmlActions.UploadFileIDdocumentImage()
            pages.kycAmlActions.uploadFileProofCE()
            pages.kycAmlActions.kycProofDocumnetDelete()
            pages.kycAmlActions.kycNextPageRedirectionSingle()

        })
        it("C5676: Corporate Entity", () => {
            //Verify Upload Document
            pages.kycAmlActions.verifyBackButton()
            pages.kycAmlActions.verifyKYCHeaderTitle()
            pages.kycAmlActions.fillCEKYCCorporateEntity()
            pages.kycAmlActions.clickOnNextStepButton()
            pages.kycAmlActions.kycNextPageRedirectionSingle()


        })
        it("C5677: Participant Information", () => {
            pages.kycAmlActions.verifyKYCHeaderTitle()
            //skipped due to add more issue
            //pages.kycAmlActions.fillCEKYCParticipantInformation()
            pages.kycAmlActions.kycNextPageRedirectionSingle()

        })
        it("C5678: Corporate Documents-Upload", () => {
            pages.kycAmlActions.fillCEKYCCorporateDocumnet()
            pages.kycAmlActions.entityNameInputTaxForm()
            pages.kycAmlActions.kycCorporateDocumnetDelete()
            pages.kycAmlActions.kycNextPageRedirectionSingle()
            pages.generalActions.waitToLoadElement()

        })
        it("C5688: Tax Form-First Form", {
            scrollBehavior: false
        }, () => {
            //1st Tax Form-Country
            pages.myTaxFormActions.verifyHeaderTileTaxForm()
            pages.myTaxFormActions.verifyCountryHeading()
            pages.myTaxFormActions.verifyCountryDescription()
            pages.myTaxFormActions.verifyCountryInput()
            pages.myTaxFormActions.clickonNextButtonTax()

        })
        it("C5689: Tax Form-Second Form", () => {
            pages.myTaxFormActions.verifyBackButton()
            pages.myTaxFormActions.verifySecondTaxForm()
            pages.myTaxFormActions.verifySecondTaxFormLabels()
            pages.myTaxFormActions.clickonNextButtonTax()
        })
        it("C5690: Tax Form-Third Form", () => {
            pages.myTaxFormActions.verifyBackButton()
            pages.myTaxFormActions.investorTaxFormTable()
            pages.myTaxFormActions.verifyInputCheckboxes()
            pages.myTaxFormActions.vefiytableHeader()
            pages.kycAmlActions.ScrollBottom()
            pages.myTaxFormActions.clickonNextButtonTax()
        })
        it("C5691: Tax Form-Forth Form Self Certificate", () => {

            pages.myTaxFormActions.checkIndividualCertificate()
            pages.myTaxFormActions.clickonNextButtonTax()

        })
        it("C5692: Tax Form-Certificate Fill", () => {
            //pages.myTaxFormActions.fillTaxGlobalFormDocusign()
            //pages.myTaxFormActions.clickonFinishDocusign()
            pages.myTaxFormActions.taxFormCompletedVerificationAlert()
            pages.myTaxFormActions.clickonNextButtonTax()


        })
        it.skip("Skipped: Tax Form-Fifth Form Documnet and Replace Document", () => {
            pages.myTaxFormActions.verifyGotoapplicationLink()
            pages.myTaxFormActions.clickOnChangeFormButton()
            pages.myTaxFormActions.selectTaxFormW9Form()
            pages.myTaxFormActions.selectTBBENForm()
            pages.myTaxFormActions.clickonNextButton()
            pages.myTaxFormActions.checkIndividualCertificate()
            pages.myTaxFormActions.clickonNextButtondb()


        })
        it.skip("Skipped: Navigate to Personal information", () => {
            pages.kycAmlActions.kycNextPageRedirection()
            pages.generalActions.pageReload()
        })
        it("C5693: Bank Detail Form-Location", () => {
            //pages.myBankDetailActions.selectBankLocation()
            //pages.myTaxFormActions.clickonNextButton()
            pages.myBankDetailActions.bankDetailForm()
            pages.myTaxFormActions.clickonNextButtonTax()

        })
        it("C5694: Program Document", () => {
            pages.myBankDetailActions.clickonPreviewModal()
            //pages.myBankDetailActions.clickonModalDownloadButton()
            pages.myBankDetailActions.clickonModalCloseButton()
            pages.myBankDetailActions.clickonDownloadIcon()
            pages.myBankDetailActions.selectiObjectAgreement()
            cy.get('.sc-ciOKUB').click()

        })
        it("C5695: Review Document", () => {
            pages.myBankDetailActions.verifyTextOnReviewDocumentPage()
            pages.myBankDetailActions.verifyDocumentPreviewModal()
            pages.myBankDetailActions.clickOModalCloseButton()
            pages.myBankDetailActions.checkagreementCheckBox()
            pages.myBankDetailActions.verifyNextButtonDisabled()
            //pages.myBankDetailActions.clickOModalCloseButton()
            pages.myBankDetailActions.clickOnNextButtonReviewDocument()
            pages.myBankDetailActions.verifygoToMYApplication()



        })

        after(() => {
            pages.investorHomeActions.logoutUser()
        })


    });

    context('TC07 KYC/AML FinancialAdmin - Approval', {
        scrollBehavior: false
    }, () => {

        before(() => {
            pages.generalActions.conditionalLoginFinancialUser()
        })

        it('C5679: Fin-KYC/AML Approval Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('C5680: Fin-KYC/AML Approval Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        });
        it('C5684: Fin-Approve the Assigned Task', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.addCommentInTextbox()
            pages.kycAmlActions.selectRiskValueRating()
            pages.myTasksActions.clickOnAddCommentButton()
            pages.myTasksActions.clickOnApproveButton()
        });

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        });

    });

    context('Application Overview Verification/ Subscription Document Verfication', () => {

        before(() => {
            pages.generalActions.conditionalLoginForInvestor()
        })
        it("C5696: My Application Overview Verify Welcome Text & Investor URL", () => {
            pages.investorHomeActions.verifyInvestorHomeUrl()
            pages.investorHomeActions.verifyWelcomeHeaderTitle()
        })
        it("C5697: My Application Overview Navigate to Latest Funds On Tile", () => {
            pages.investorHomeActions.clickOnapplicationinprogress1st()

        })
        it("C5698: My Application Overview-Header Verification", () => {
            pages.myApplicationOverviewActions.verifyHeaderSection()
            pages.myApplicationOverviewActions.verifyApplicationTimelineStatus()
        })
        it("C5699: My Application Overview-Investor Information", () => {
            pages.myApplicationOverviewActions.verifyInvestorInformation()
        })
        it("C5700: My Application Overview-Investment Amount", () => {
            pages.myApplicationOverviewActions.verifyInvestmentInformation()

        })
        it("C5701: My Application Overview-Eligibility Criteria", () => {
            pages.myApplicationOverviewActions.verifyEligibilityCriteriacop()

        })
        it("C5702: My Application Overview-Personal Information", () => {
            pages.myApplicationOverviewActions.verifyPeronalInformation()

        })
        it("C5703: My Application Overview-Home Address", () => {
            pages.myApplicationOverviewActions.verifyHomeAddress()

        })
        it("C5704: My Application Overview-Upload Document", () => {
            pages.myApplicationOverviewActions.verifyUploadDocument()

        })
        it("C5705: My Application Overview-Corporate Entity", () => {
            pages.myApplicationOverviewActions.verifyCorporateEntity()

        })
        it("C5707: My Application Overview-Corporate Documents", () => {
            pages.myApplicationOverviewActions.verifyCorporateDocuments()

        })
        it("C5708: My Application Overview-Participant's information", () => {
            pages.myApplicationOverviewActions.verifyParticipantsInformation()

        })
        it("C5710: My Application Overview-Tax Details", () => {
            pages.myApplicationOverviewActions.verifyTaxDetails()

        })
        it("C5711: My Application Overview-Tax Forms", () => {
            pages.myApplicationOverviewActions.verifyTaxForms()

        })
        it("C5712: My Application Overview-Banking Details", () => {
            pages.myApplicationOverviewActions.verifyBankingDetails()

        })
        it.skip("C5713: My Application Overview-Documents", () => {
            pages.myApplicationOverviewActions.verifyDocuments()

        })
        it("C5714: My Application Overview-Program Documents", () => {
            pages.myApplicationOverviewActions.verifyProgramDocuments()

        })
        it("Investor-Navigate to Subscription Document", () => {
            pages.myApplicationActions.continueyourApplication()
            pages.generalActions.waitForTime(3000)
        })
        it("C94923: Subscription Document Verfication", () => {

            pages.subcriptionDocumentActions.verifySubscriptionDocument()

        })


        after(() => {
            pages.investorHomeActions.logoutUser()
        })

    })

})