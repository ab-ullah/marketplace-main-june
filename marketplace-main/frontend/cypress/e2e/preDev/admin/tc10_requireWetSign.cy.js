import * as pages from '../../../core/pageObjects/pages'

describe('TC10 Require Wet Sign Test Suite', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('Navigate to Company Page', () => {
        pages.homeActions.clickOnCompanyHeaderLink()
        pages.companyActions.verifyCompanyPageUrl()
    })

    it('Verify Input Fields and Click Add Document Button', { scrollBehavior: false }, () => {
        pages.companyActions.verifyHeaderTitle()
        pages.companyActions.verifyAndTypeInInput()
        pages.companyActions.clickOnAddDocumentButton()
    })

    it('Fill Form and Attach Document', { scrollBehavior: false }, () => {
        pages.companyActions.typeInNameAndDescriptionInput()
        pages.companyActions.uploadDocument()
        pages.companyActions.clickOnRequireCheckboxes()
    });

    it('Save the Doc and Verify Submission', () => {
        pages.companyActions.clickOnSaveButton()
        pages.companyActions.verifyDocSubmission()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });

})