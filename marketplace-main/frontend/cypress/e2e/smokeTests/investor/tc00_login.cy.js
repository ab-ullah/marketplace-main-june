import * as pages from '../../../core/pageObjects/pages'

describe('Login Test Suite', () => {

    before(() => {
        pages.generalActions.loginInvestorUser()
    })

    it('TC1 - Verify navigation after login', () => {
        pages.investorHomeActions.verifyInvestorHomeUrl()
        pages.investorHomeActions.verifyHeaderTitleText()
    })

    after(() => {
        pages.investorHomeActions.logoutUser()
    });
})