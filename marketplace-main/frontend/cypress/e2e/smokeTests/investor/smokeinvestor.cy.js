/// <reference types= "cypress" />
import homeElements, * as elements from '../../../core/pageObjects/elements/general/homeElements'
import investorHomeElements from '../../../core/pageObjects/elements/general/investorHomeElements'
import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'

var getText;
describe('Investor Smoke - Invest As an Individual', () => {

    context('TC01 Create Fund/ Eligibility Criteria/ Approval of Eligibility', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('Create Fund Test Invite Only Case', () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.uploadFundTemplateInvite()
            pages.createFundActions.clickOnCreateButton()
        })
        it('Verify Fund Data and Save', {
            scrollBehavior: false
        }, () => {

            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.redirectToHomepage()

        })
        it('Click on Edit Fund Document Link to Upload File', () => {

            pages.homeActions.clickOnEditFundDocumentLink()
        })
        it('Verify Modal Title and Upload File', () => {
            pages.homeActions.verifyModalTitleIsDisplayed()
            pages.homeActions.uploadDocsCE()
            pages.homeActions.checkRequiredSignature()
            pages.homeActions.verifyFundDocumnetUpload()
            pages.homeActions.clickOnCloseModalButton()
            pages.createFundActions.redirectToHomepage()
        })
        it('Eligibility Criteria-Click on Latest Fund from Funds Col', () => {

            //pages.homeActions.clickOnFundTitleInTheTable()
            pages.homeActions.clickLatestFund()
            pages.homeActions.getLatestFundID()
        });
        it('Eligibility Criteria-Check For Latest Fund', {
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
        it('Eligibility Criteria-Add Blocks for US', {
            scrollBehavior: false
        }, () => {
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.createEligibilityFormActions.addQualifiedPurchaserBlock()
            pages.createEligibilityFormActions.addUSAccreditedBlock()
            pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
            pages.createEligibilityFormActions.closeAddBlocksModal()
        });
        it('Eligibility Criteria-Fill Preview Form', {
            scrollBehavior: false
        }, () => {

            pages.createEligibilityFormActions.clickOnPreviewButton()
            //Lables Updated
            //pages.previewEligibilityFormActions.clickOnStartButton()
            // fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()
            //fill qualified purchaser
            pages.previewEligibilityFormActions.fillQualifiedPurchaserForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
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
            pages.createFundActions.redirectToHomepage()
        });
        it('Approval of Eligibility-Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('Approval of Eligibility-Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        });
        it('Approval of Eligibility-Approve the Assigned Task', {
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
        it('C11836: Approval of Eligibility-Publish Accept Applications for Fund', {
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

    context("TC02 Investor's - Find Fund and click on Apply Now Link", () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()

        });

        it("C11854: Apply Button-Find Same Fund and Only Perform one Click on Apply Button", () => {

            pages.generalActions.clickButtonUsingLocator(homeElements.firstfund).then(($vc) => {
                getText = $vc.text()
                cy.contains(getText).click()

                pages.homeActions.clickOnLogoutButton()
                pages.generalActions.conditionalLoginForInvestor()
                pages.generalActions.clickButtonUsingLocator(investorHomeElements.fundTableCellDiv).contains(getText).parents("div[role=row]").then(elem => {
                    const parentRow = 'div[aria-rowindex="' + elem[0].ariaRowIndex + '"]'
                    //pages.generalActions.getElementUsingLocator(parentRow).contains(labels.investorHomeLabels.applyNowLinkLabel).invoke('removeAttr', 'target').click()
                    pages.generalActions.getElementUsingLocator(parentRow).contains('Apply Now').then(link => {
                        pages.generalActions.visitLink(link[0].dataset.applyLink)
                        pages.generalActions.pageReload()
                        //pages.investorHomeActions.logoutUser()
                    })
                })
            })



            //fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataWrongCountry(data.eligibilityData.createEligibility.investment_country_wrong)
            pages.previewEligibilityFormActions.clickOnNextButton()
            pages.previewEligibilityFormActions.verifyNotEligible()
            pages.previewEligibilityFormActions.fillPreviewFormDataIN(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.verifyInvestmentCountryQuestions()
            pages.previewEligibilityFormActions.clickOnNextButton()

            pages.previewEligibilityFormActions.fillQualifiedPurchaserForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.generalActions.waitForTime(3000)
            pages.previewEligibilityFormActions.clickOnNextButton()


            // pages.generalActions.conditionalLoginForInvestor()
            // pages.investorHomeActions.clickOnapplicationinprogress1st()
            // pages.myApplicationActions.continueyourApplication()


            pages.previewEligibilityFormActions.fillAccreditedFormWithOption2()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.generalActions.waitForTime(3000)
            pages.previewEligibilityFormActions.clickOnNextButton()
            // fill third form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.generalActions.waitForTime(3000)
            pages.previewEligibilityFormActions.clickOnNextButton()
            //upload fund template


            pages.previewEligibilityFormActions.uploadFundTemplate()
            pages.previewEligibilityFormActions.verifyFundTemplateUpload()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // fill and verify equity form
            pages.previewEligibilityFormActions.verifyEquityInputAlert()
            pages.previewEligibilityFormActions.fillEquityFormData()
            //pages.previewEligibilityFormActions.verifyEligibilityLimitCheckLink()
            pages.previewEligibilityFormActions.clickAndVerifyEquityAndLevergeValue()
            pages.previewEligibilityFormActions.clickOnSubmitInfoButton()
            pages.previewEligibilityFormActions.clickOnMyApplicationButton()
            pages.investorHomeActions.redirectToFundListingPage()
        })
        it('Verify Title Header Text', () => {
            pages.investorHomeActions.verifyWelcomeHeaderTitle()
        });
        it('Verify Application in Progress Section', () => {
            pages.investorHomeActions.verifyApplicationinProgressSection()
        });
        it('Verify Investment Opportunities Section/ Header/ Column', () => {
            pages.investorHomeActions.verifyInvestmentOpportunitySection()
            pages.investorHomeActions.verifyInvestmentOpportunityHeader()
        });
        it('Verify Counters', () => {
            pages.investorHomeActions.verifyCountersOnHome()
        });
        it('C11855: Verify Bottom Labels', {
            scrollBehavior: false
        }, () => {
            pages.investorHomeActions.verifyBottomQuestions()
            pages.investorHomeActions.verifyHelpCenterButton()
        });

        after(() => {
            pages.investorHomeActions.logoutUser()
        });


    });

    context('TC03 Eligibility Decision KnowledgeableAdmin - Approval', () => {

        before(() => {
            pages.generalActions.conditionalLoginKnowledgeableAdminUser()
        })

        it('Knw-Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('Knw-Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()

        })
        it('C11856: Knw-Approval', {
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
        it('Fin-Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('Fin-Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        });
        it('C11857: Fin-Request-Approval', {
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

        it('Master Class Selection-Navigate to Latest Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickLatestFund()
            pages.createFundActions.verifyFundTitle()
        })
        it('Master Class Selection-Navigate to Applicant Management Tab for the Fund', () => {
            pages.generalActions.pageReload()
            pages.applicantManagementActions.clickOnApplicantManagementTab()
        })
        it('Master Class Selection-Verify Header Title and Applicant Row', () => {
            pages.applicantManagementActions.verifyHeaderTitle()
            pages.applicantManagementActions.verifyApplicantRecordInTable()
        })
        it('Master Class Selection-Click on Action Icon and View Option', () => {
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.applicantManagementActions.clickOnEditSubActionbeforeApproval()
        })
        it('Select Vehicle Option', () => {
            pages.applicantManagementActions.selectVehicleOption()
        })
        it('Select Share Class Option', () => {

            pages.applicantManagementActions.selectShareClassOption()
        })
        it('Save the Edit Changes', () => {
            pages.applicantManagementActions.clickOnEditApplicantSaveButton()
        })
        it('Admin Approval of Fund-Navigate to Latest Fund', {
            scrollBehavior: false
        }, () => {
            pages.createFundActions.redirectToHomepage()
            pages.homeActions.clickLatestFund()
            pages.createFundActions.verifyFundTitle()
        })
        it('Admin Approval of Fund-Navigate to Applicant Management Tab for the Fund', () => {
            pages.applicantManagementActions.clickOnApplicantManagementTab()
        })
        it('C11858: Click on Action Icon and Approve', () => {
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.generalActions.waitForTime(2000)
            pages.applicantManagementActions.clickOnApproveSubActionLink()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        });

    });

    context('TC06 Investor-KYC/ AML Process', () => {

        before(() => {
            pages.generalActions.conditionalLoginForInvestor()
        })

        it("Investor-Verify Welcome Text & Investor URL", () => {
            pages.investorHomeActions.verifyInvestorHomeUrl()
            pages.investorHomeActions.verifyWelcomeHeaderTitle()
        })
        it("Investor-Navigate to Latest Funds On Tile", () => {
            pages.investorHomeActions.clickOnapplicationinprogress1st()
        })
        it("Investor-Navigate to KYC/ AML", () => {
            pages.myApplicationActions.continueyourApplication()
            pages.generalActions.waitForTime(3000)

        })
        it("C11859: Input Corporate Entries of Personal Information", () => {
            pages.kycAmlActions.verifyKYCHeaderTitle()
            pages.kycAmlActions.verifyNextButtonisDisabled()
            pages.kycAmlActions.fillCEKYCPersonalInformationforAnIndividual()
            pages.kycAmlActions.verifykycHeaderPersonalInformation()
            pages.kycAmlActions.kycNextButtonOnPersonalInformation()
            pages.kycAmlActions.kycNextButtonOnPersonalInformation()


        })
        it("C11860: Input of Home Address", () => {
            //Canada
            pages.kycAmlActions.verifyNextButtonisDisabled()
            pages.kycAmlActions.inputKYCHomeAddressOtherUSA()
            //USA
            pages.kycAmlActions.verifykycHeaderHomeAddress()
            pages.kycAmlActions.inputKYCHomeAddress()
            pages.kycAmlActions.clickOnNextStepButton()


            pages.kycAmlActions.kycNextPageRedirectionSingle()

        })
        it("C11861: Input of Upload Document", () => {

            pages.kycAmlActions.verifyKYCHeaderTitle()
            pages.kycAmlActions.verifyNextButtonisDisabled()
            pages.kycAmlActions.inputUploadDocumentForm()
            pages.kycAmlActions.UploadFileIDdocumentImage()
            pages.kycAmlActions.uploadFileProofCE()
            pages.kycAmlActions.kycProofDocumnetDelete()
            pages.kycAmlActions.kycNextPageRedirectionSingle()

        })

        it("C11862: Tax Form-First Form", {
            scrollBehavior: false
        }, () => {
            //1st Tax Form-Country
            pages.myTaxFormActions.verifyHeaderTileTaxForm()
            pages.myTaxFormActions.verifyCountryHeading()
            pages.myTaxFormActions.verifyCountryDescription()
            pages.myTaxFormActions.verifyCountryInput()
            pages.myTaxFormActions.clickonNextButtonTax()

        })
        it("C11863: Tax Form-Second Form", () => {
            pages.myTaxFormActions.verifyBackButton()
            pages.myTaxFormActions.verifySecondTaxForm()
            pages.myTaxFormActions.verifySecondTaxFormLabelsIN()
            pages.myTaxFormActions.clickonNextButtonTax()
        })
        it("C11864: Tax Form-Third Form", () => {
            pages.myTaxFormActions.verifyBackButton()
            pages.myTaxFormActions.investorTaxFormTable()
            pages.myTaxFormActions.verifyInputCheckboxes()
            pages.myTaxFormActions.vefiytableHeader()
            pages.kycAmlActions.ScrollBottom()
            pages.myTaxFormActions.clickonNextButtonTax()
        })
        it("C11865: Tax Form-Forth Form Self Certificate", () => {

            pages.myTaxFormActions.checkIndividualCertificate()
            pages.myTaxFormActions.clickonNextButtonTax()

        })
        it("C11866: Tax Form-Certificate Fill", () => {
            //pages.myTaxFormActions.fillTaxGlobalFormDocusign()
            //pages.myTaxFormActions.clickonFinishDocusign()
            pages.myTaxFormActions.taxFormCompletedVerificationAlert()
            pages.myTaxFormActions.clickonNextButtonTax()


        })
        it("C11867: Bank Detail Form-Location", () => {
            //skipped due to change
            // pages.myBankDetailActions.selectBankLocation()
            // pages.myTaxFormActions.clickonNextButton()
            pages.myBankDetailActions.bankDetailForm()
            pages.myTaxFormActions.clickonNextButtonTax()

        })
        it("C11868: Program Document", () => {
            pages.myBankDetailActions.clickonPreviewModal()
            //pages.myBankDetailActions.clickonModalDownloadButton()
            pages.myBankDetailActions.clickonModalCloseButton()
            pages.myBankDetailActions.clickonDownloadIcon()
            pages.myBankDetailActions.selectiObjectAgreement()
            pages.generalActions.waitForTime(4000)
            pages.myTaxFormActions.clickonNextButtonTax()


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

        it('Fin-KYC/AML Approval Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })
        it('Fin-KYC/AML Approval Click on First Element in My Tasks Table', {
            scrollBehavior: false
        }, () => {
            pages.myTasksActions.clickOnFirstEligibilityInTable()
        });

        it('C11869: Fin-Approve the Assigned Task', {
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

    context('TC08 Investor Application Overview Verification/ Subscription Document', () => {

        before(() => {
            pages.generalActions.conditionalLoginForInvestor()
        })

        it("Investor Verify Welcome Text & Investor URL", () => {
            pages.investorHomeActions.verifyInvestorHomeUrl()
            pages.investorHomeActions.verifyWelcomeHeaderTitle()
        })
        it("Investor Navigate to Latest Funds On Tile", () => {
            pages.investorHomeActions.clickOnapplicationinprogress1st()
        })
        it("My Application Overview-Header Verification", () => {
            pages.myApplicationOverviewActions.verifyHeaderSection()
            pages.myApplicationOverviewActions.verifyApplicationTimelineStatusIN()
        })
        it("My Application Overview-Investor Information", () => {
            pages.myApplicationOverviewActions.verifyInvestorInformationIN()
        })
        it("My Application Overview-Investment Amount", () => {
            pages.myApplicationOverviewActions.verifyInvestmentInformation()

        })
        it("My Application Overview-Eligibility Criteria", () => {
            pages.myApplicationOverviewActions.verifyEligibilityCriteria()

        })
        it("My Application Overview-Personal Information", () => {
            pages.myApplicationOverviewActions.verifyPeronalInformationIN()

        })
        it("My Application Overview-Home Address", () => {
            pages.myApplicationOverviewActions.verifyHomeAddress()

        })
        it("My Application Overview-Upload Document", () => {
            pages.myApplicationOverviewActions.verifyUploadDocument()

        })

        it("My Application Overview-Tax Details", () => {
            pages.myApplicationOverviewActions.verifyTaxDetailsIN()

        })
        it("My Application Overview-Tax Forms", () => {
            pages.myApplicationOverviewActions.verifyTaxForms()

        })
        it("My Application Overview-Banking Details", () => {
            pages.myApplicationOverviewActions.verifyBankingDetails()

        })
        it("C11870: My Application Overview-Program Documents", () => {
            pages.myApplicationOverviewActions.verifyProgramDocuments()

        })
        it("Investor-Navigate to Subscription Document", () => {
            pages.myApplicationActions.continueyourApplication()
            pages.generalActions.waitForTime(3000)
        })
        it("C11871: Subscription Document Verfication", () => {

            pages.subcriptionDocumentActions.verifySubscriptionDocument()

        })

        after(() => {
            pages.investorHomeActions.logoutUser()
        })

    })


})