import * as pages from '../../../core/pageObjects/pages'

describe('Login Test Suite', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('C1238: Verify user login into the system', () => {
        pages.homeActions.verifyFundsHomeUrl()
        pages.homeActions.verifyHeaderTitleText()
    })

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})