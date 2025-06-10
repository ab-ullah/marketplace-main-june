import * as pages from '../../../core/pageObjects/pages'

describe('TC01 Create Fund Test Suite', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('Navigate to Company Page', () => {
        pages.homeActions.clickOnCompanyHeaderLink()
        pages.companyActions.verifyCompanyPageUrl()
    })

    it('Add Logo, Verify Input Fields and Click Add Document Button', { scrollBehavior: false }, () => {
        pages.companyActions.verifyHeaderTitle()
        pages.companyActions.uploadCompanyLogo()
        pages.companyActions.verifyAndTypeInInput()
        pages.companyActions.clickOnAddDocumentButton()
    })

    it('Fill Form and Attach Document', { scrollBehavior: false }, () => {
        pages.companyActions.typeInNameAndDescriptionInput()
        pages.companyActions.uploadDocument()
        pages.companyActions.clickOnSaveButton()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})