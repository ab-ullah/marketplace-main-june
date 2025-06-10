import * as pages from '../../../core/pageObjects/pages'

describe('TC01 Create Fund Test Suite', () => {

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
    });
})