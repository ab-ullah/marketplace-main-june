import * as pages from '../../../core/pageObjects/pages'

describe('TC09 Filterr Fund Test Suite', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('Filter Fund from Filter Bar and Verify', () => {
        pages.homeActions.typeInFilterInput()
        pages.generalActions.waitForTime(3000)
        pages.homeActions.verifyFilteredFundResult()
    });

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    });
})