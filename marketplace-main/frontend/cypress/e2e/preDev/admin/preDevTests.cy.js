import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'
import investorHomeElements from '../../../core/pageObjects/elements/general/investorHomeElements'
import homeElements, * as elements from '../../../core/pageObjects/elements/general/homeElements'
var getText;
describe('Pre Dev Test Suite', () => {

    // New Test
    context('TC01 Create Fund Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4096: Verify Admin Creates a Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()
            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.clickOnSaveButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    // New Test
    context('TC02 Eligibility Criteria Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('Click on Latest Fund from Funds Col', () => {
            pages.homeActions.clickOn1stFundTitleInTheTable()
        });

        it('C4097: Verify Admin creates a new eligibility criteria', {
            scrollBehavior: false
        }, () => {
            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()

            pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
            pages.createEligibilityFormActions.addTextInCommentBox()
            pages.createEligibilityFormActions.clickOnAddCommentButton()
            pages.createEligibilityFormActions.editFinalBlockInputs()

            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.createEligibilityFormActions.addUSAccreditedBlock()
            pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
            pages.createEligibilityFormActions.closeAddBlocksModal()

            pages.createEligibilityFormActions.clickOnPreviewButton()
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

            pages.previewEligibilityFormActions.clickOnSubmitReviewButton()
            pages.previewEligibilityFormActions.fillSubmitReviewForm(data.eligibilityData.createEligibility.reviewer)
            pages.previewEligibilityFormActions.clickOnModalSendButton()
            pages.previewEligibilityFormActions.verifySubmitReviewSuccess()
            pages.previewEligibilityFormActions.closePopupModal()
        });

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    // New Test
    context('TC03 Publish Funds Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('Navigate to My Tasks', () => {
            pages.homeActions.clickOnMyTasksButton()
        })

        it('C4098: Verify Admin publishes the fund', {
            scrollBehavior: false
        }, () => {
            pages.generalActions.waitForTime(15000)
            pages.myTasksActions.clickOnFirstEligibilityInTable()
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
        })

    })

    // New Test
    context('TC04 Delete Fund Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4099: Verify Admin deletes a fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()

            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()

            pages.createFundActions.clickOnDeleteFundButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    // New Test
    context('TC05 Delete Eligibility Test', () => {

        context('Create Fund', () => {

            before(() => {
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('Create a fund', {
                scrollBehavior: false
            }, () => {
                pages.homeActions.clickOnCreateFundBtn()
                pages.createFundActions.fillCreateFundForm()
                pages.createFundActions.clickOnCreateButton()

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
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('Click on Latest Fund from Funds Col', () => {
                pages.homeActions.clickOnFundInTheTable()
            })

            it('Eligibility Criteria Check For Latest Fund', {
                scrollBehavior: false
            }, () => {
                pages.eligibilityCriteriaActions.clickOnEligibilityTab()
                pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
                pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
                pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            })

            it('Create Eligibility Form Page', {
                scrollBehavior: false
            }, () => {
                pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
                pages.createEligibilityFormActions.addTextInCommentBox()
                pages.createEligibilityFormActions.clickOnAddCommentButton()
                pages.createEligibilityFormActions.editFinalBlockInputs()
            })

            it('Add Blocks for US', {
                scrollBehavior: false
            }, () => {
                pages.createEligibilityFormActions.clickOnAddBlocksButton()
                pages.createEligibilityFormActions.addUSAccreditedBlock()
                pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
                pages.createEligibilityFormActions.closeAddBlocksModal()
            })

            it('Fill Preview Form', {
                scrollBehavior: false
            }, () => {
                pages.createEligibilityFormActions.clickOnPreviewButton()
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
            })

            it('Submit for Review', {
                scrollBehavior: false
            }, () => {
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
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('C4100: Verify Admin deletes an eligibility form', {
                scrollBehavior: false
            }, () => {
                pages.homeActions.clickOnFundInTheTable()

                pages.eligibilityCriteriaActions.clickOnEligibilityTab()

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

    // New Test
    context('TC06 Add Fund Document Test', () => {

        context('Create Fund', () => {

            before(() => {
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('Create Fund Test', {
                scrollBehavior: false
            }, () => {
                pages.homeActions.clickOnCreateFundBtn()
                pages.createFundActions.fillCreateFundForm()
                pages.createFundActions.clickOnCreateButton()
                // Verify Fund Data and Save
                pages.createFundActions.verifyFundTitle()
                pages.createFundActions.verifyFundData()
                pages.createFundActions.scrollToSaveButton()
            })

            after(() => {
                pages.homeActions.clickOnLogoutButton()
            })

        })

        context('Add Fund Document', () => {

            before(() => {
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('C4102: Verify Admin adds fund documents to a fund for all investors and for a specific share class', {
                scrollBehavior: false
            }, () => {
                pages.homeActions.clickOnEditFundDocumentLink()
                // Verify Modal Title and Upload File
                pages.homeActions.verifyModalTitleIsDisplayed()
                pages.homeActions.uploadFundTemplate()
                // Verify Doc Uploaded Successfully and Mark Checkboxes'
                pages.homeActions.verifyDocumentUpload()
                pages.homeActions.clickRequiredCheckboxesOnModal()
                pages.homeActions.selectGPSignerFromDropdown()
                // Close Modal
                pages.homeActions.clickOnCloseModalButton()
            })

            after(() => {
                pages.homeActions.clickOnLogoutButton()
            })

        })

    })

    context('TC07 Invite Only Fund Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4103: Verify Admin creates a fund invite only with template', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnInviteOnlyOption()
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

    context('TC08 Company Doc Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it("C4104: Verify Admin adds a document that doesn't require signature (Program Document) ", {
            scrollBehavior: false
        }, () => {
            // Navigate to Company Page
            pages.homeActions.clickOnCompanyHeaderLink()
            pages.companyActions.verifyCompanyPageUrl()
            // Add Logo, Verify Input Fields and Click Add Document Button
            pages.companyActions.verifyHeaderTitle()
            pages.companyActions.uploadCompanyLogo()
            pages.companyActions.verifyAndTypeInInput()
            pages.companyActions.clickOnAddDocumentButton()
            // Fill Form and Attach Document
            pages.companyActions.typeInNameAndDescriptionInput()
            pages.companyActions.uploadDocument()
            pages.companyActions.clickOnSaveButton()
            pages.companyActions.deleteCompanyDocument()

        });

        after(() => {
            //pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC09 Filter Fund Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4107: Verify Admin filters the fund', () => {
            pages.homeActions.typeInFilterInput()
            pages.generalActions.waitForTime(3000)
            pages.homeActions.verifyFilteredFundResult()
        });

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC10 Require Wet Signature Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4105: Verify Admin adds a document that require wet signature (Power of Attorney)', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCompanyHeaderLink()
            pages.companyActions.verifyCompanyPageUrl()
            // Verify Input Fields and Click Add Document Button
            pages.companyActions.verifyHeaderTitle()
            pages.companyActions.verifyAndTypeInInput()
            pages.companyActions.clickOnAddDocumentButton()
            // Fill Form and Attach Document
            pages.companyActions.typeInNameAndDescriptionInput()
            pages.companyActions.uploadDocument()
            pages.companyActions.clickOnRequireCheckboxes()
            // Save the Doc and Verify Submission', () => {
            pages.companyActions.clickOnSaveButton()
            pages.companyActions.verifyDocSubmission()
            pages.companyActions.deleteCompanyDocument()
        });

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC11 Investor View Page Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4106: Verify Admin can view the application of an investor', () => {
            pages.homeActions.typeInFilterInput()
            pages.generalActions.waitForTime(3000)
            pages.homeActions.verifyFilteredFundResult()

            //pages.homeActions.clickOnApplicantReviewFund()
            pages.homeActions.clickOn1stFundTitleInTheTable()
            // Navigate to Applicant Management Tab for the Fund
            pages.applicantManagementActions.clickOnApplicantManagementTab()
            // Verify Header Title and Applicant Row
            pages.applicantManagementActions.verifyHeaderTitle()
            pages.applicantManagementActions.verifyApplicantRecordInTable()
            // Click on Action Icon and View Option
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.applicantManagementActions.clickOnViewSubActionLink()
            // Verify Investor View Page Titles
            pages.applicantManagementActions.verifyInvestorViewPageTitles()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC12 Applicant Edit Option Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4108: Verify Admin can add the fund vehicle and the share class from Edit Applicant page', () => {
            pages.homeActions.typeInFilterInput()
            pages.generalActions.waitForTime(3000)
            pages.homeActions.verifyFilteredFundResult()

            //pages.homeActions.clickOnApplicantReviewFund()
            pages.homeActions.clickOn1stFundTitleInTheTable()
            // Navigate to Applicant Management Tab for the Fund
            pages.applicantManagementActions.clickOnApplicantManagementTab()
            // Verify Header Title and Applicant Row
            pages.applicantManagementActions.verifyHeaderTitle()
            pages.applicantManagementActions.verifyApplicantRecordInTable()
            // Click on Action Icon and View Option
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.applicantManagementActions.clickOnEditSubActionLink()
            // Select Vehicle and Share Class Option
            pages.applicantManagementActions.selectVehicleAndShareClassOption()
            // Save the Edit Changes
            pages.applicantManagementActions.clickOnEditApplicantSaveButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC13 Investor Account Code Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4109: Verify Admin can add the Investor Account Code', () => {
            // Click on Fund with Status Applicant Review
            pages.homeActions.typeInFilterInput()
            pages.generalActions.waitForTime(3000)
            pages.homeActions.verifyFilteredFundResult()
            //pages.homeActions.clickOnApplicantReviewFund()
            // Navigate to Applicant Management Tab for the Fund
            pages.homeActions.clickOn1stFundTitleInTheTable()
            pages.applicantManagementActions.clickOnApplicantManagementTab()
            // Verify Header Title and Applicant Row
            pages.applicantManagementActions.verifyHeaderTitle()
            pages.applicantManagementActions.verifyApplicantRecordInTable()
            // Click on Action Icon and View Option
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.applicantManagementActions.clickOnEditSubActionLink()
            // Add Investor Account Code Value
            pages.applicantManagementActions.addInvestorAccountCodeValue()
            // Save the Edit Changes
            pages.applicantManagementActions.clickOnEditApplicantSaveButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC14 Request Doc Test', () => {

        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('C4110: Verify Admin creates requests', () => {
            pages.homeActions.typeInFilterInput()
            pages.generalActions.waitForTime(3000)
            pages.homeActions.verifyFilteredFundResult()
            //pages.homeActions.clickOnApplicantReviewFund()
            // Navigate to Applicant Management Tab for the Fund
            pages.homeActions.clickOn1stFundTitleInTheTable()
            pages.applicantManagementActions.clickOnApplicantManagementTab()
            // Verify Header Title and Applicant Row
            pages.applicantManagementActions.verifyHeaderTitle()
            pages.applicantManagementActions.verifyApplicantRecordInTable()
            // Click on Action Icon and View Option'
            pages.applicantManagementActions.clickOnActionsDotIcon()
            pages.applicantManagementActions.clickOnViewSubActionLink()
            // Click on Add Request Doc Button'
            pages.applicantManagementActions.clickOnAddDocRequestButton()
            // Type Request Doc Name and Input and Save
            pages.applicantManagementActions.addRequestDocNameAndDescription()
            pages.applicantManagementActions.clickOnSaveButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC15 Request Revisions Test', () => {

        context('Create Fund', () => {

            before(() => {
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('Create Fund Test', () => {
                pages.homeActions.clickOnCreateFundBtn()
                pages.createFundActions.fillCreateFundForm()
                pages.createFundActions.clickOnCreateButton()
            })

            it('Verify Fund Data and Save', {
                scrollBehavior: false
            }, () => {
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
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('Open the First Fund in the Table', () => {
                //pages.homeActions.clickOnFundInTheTable()
                pages.homeActions.clickOn1stFundTitleInTheTable()
            })

            it('Eligibility Criteria Check For Latest Fund', {
                scrollBehavior: false
            }, () => {
                pages.eligibilityCriteriaActions.clickOnEligibilityTab()
                pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
                pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
                pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            })

            it('Create Eligibility Form Page', {
                scrollBehavior: false
            }, () => {
                pages.createEligibilityFormActions.verifyHeaderTitle(data.eligibilityData.createEligibility.investment_country)
                pages.createEligibilityFormActions.addTextInCommentBox()
                pages.createEligibilityFormActions.clickOnAddCommentButton()
                pages.createEligibilityFormActions.editFinalBlockInputs()
            })

            it('Add Blocks for US', {
                scrollBehavior: false
            }, () => {
                pages.createEligibilityFormActions.clickOnAddBlocksButton()
                pages.createEligibilityFormActions.addUSAccreditedBlock()
                pages.createEligibilityFormActions.addUSKnowledgeableEmployeeBlock()
                pages.createEligibilityFormActions.closeAddBlocksModal()
            })

            it('Fill Preview Form', {
                scrollBehavior: false
            }, () => {
                pages.createEligibilityFormActions.clickOnPreviewButton()
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
            })

            it('Submit for Review', {
                scrollBehavior: false
            }, () => {
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
                pages.generalActions.conditionalLoginKnowledgeableAdminUser()
            })

            it('Navigate to My Tasks', () => {
                pages.homeActions.clickOnMyTasksButton()
            })

            it('Click on First Element in My Tasks Table', {
                scrollBehavior: false
            }, () => {
                pages.myTasksActions.clickOnFirstEligibilityInTable()
            })

            it('C4112: Verify Admin can approve the application of an investor', {
                scrollBehavior: false
            }, () => {
                // Approve the Assigned Task
                //pages.myTasksActions.verifyModalTitleText()
                pages.generalActions.waitForTime(15000)
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
                pages.generalActions.conditionalLoginKnowledgeableAdminUser()
            })

            it('Eligibility Flows', {
                scrollBehavior: false
            }, () => {
                // Make Eligibility Flow Ready
                pages.homeActions.clickOn1stFundTitleInTheTable()
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
                pages.generalActions.conditionalLoginForAdmin()
            })

            it('Publish Accept Applications for Fund', {
                scrollBehavior: false
            }, () => {


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
            })

            after(() => {
                pages.homeActions.clickOnLogoutButton()
            })

        })

        context('Login Investor and Verify Fund', {
            scrollBehavior: false
        }, () => {

            it('Verify Navigation and Fund Apply Link', () => {
                pages.generalActions.conditionalLoginForAdmin()
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
            })

            it('Fill Preview Form', {
                scrollBehavior: false
            }, () => {



                // fill first form
                pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
                pages.previewEligibilityFormActions.clickOnNextButton()
                // fill second form
                pages.previewEligibilityFormActions.fillAccreditedFormWithOption2()
                pages.previewEligibilityFormActions.scrollToNextButton()
                pages.generalActions.waitForTime(3000)
                pages.previewEligibilityFormActions.clickOnNextButton()
                // fill third form
                pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
                pages.generalActions.waitForTime(3000)
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

        context('Add Request Revision for Eligibility and Changes Requested', () => {

            before(() => {
                pages.generalActions.conditionalLoginKnowledgeableAdminUser()
            })

            it('Navigate to My Tasks', () => {
                pages.homeActions.clickOnMyTasksButton()
            })

            it('Click on First Element in My Tasks Table', {
                scrollBehavior: false
            }, () => {

                pages.myTasksActions.clickOnFirstEligibilityInTable()
            })

            it('C4113: Verify Admin can add a comment when reviewing an application from an investor', {
                scrollBehavior: false
            }, () => {
                // Add Revisions Request for Triggered Flags
                pages.myTasksActions.clickOnFlagIcon()
                pages.myTasksActions.typeInCreateRequestsTextarea()
                pages.myTasksActions.clickOnSendButton()
                // After request submission, verify text and click Request Revisions Button
                pages.myTasksActions.verifyApproveButtonIsDisplayed()
                pages.myTasksActions.clickOnRequestRevisionsButton()
                pages.homeActions.clickOnCloseModalButton()
            })

            after(() => {
                pages.homeActions.clickOnLogoutButton()
            })

        })

        context('Login Investor and Resubmit Changes', {
            scrollBehavior: false
        }, () => {

            before(() => {
                pages.generalActions.conditionalLoginForInvestor()
            })

            it('Verify Navigation and Fund Apply Link', () => {
                pages.investorHomeActions.verifyInvestorHomeUrl()
                pages.investorHomeActions.verifyHeaderTitleText()
                pages.investorHomeActions.clickOnApplicationArrowButton()
            })

            it('C4114: Verify Investor adds a comment when handling an admin request', {
                scrollBehavior: false
            }, () => {
                // Resubmit Changes from Investor
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
                pages.generalActions.conditionalLoginKnowledgeableAdminUser()
            })

            it('Navigate to My Tasks', () => {
                pages.homeActions.clickOnMyTasksButton()
            })

            it('C4116: Verify Admin sees the investor comment as a reply', () => {
                // Verify Changes Requested Label in Status
                pages.myTasksActions.verifyPendingLabelDisplayed
            })

            after(() => {
                pages.homeActions.clickOnLogoutButton()
            })

        })

    })

})