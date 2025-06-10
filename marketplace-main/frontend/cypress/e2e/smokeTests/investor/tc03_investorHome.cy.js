import * as pages from '../../../core/pageObjects/pages'
import data from '../../../fixtures/fundsData'

describe('TC03 Investor Home Elements Suite', () => {

    context('Login Investor and Verify Elements', () => {
        
        before(() => {
            pages.generalActions.loginInvestorUser()
        })

        it('Verify Title Header Text', () => {
            pages.investorHomeActions.verifyWelcomeHeaderTitle()
        });

        it('Verify Counters', () => {
            pages.investorHomeActions.verifyCountersOnHome()
        });

        it('Verify Bottom Labels', {scrollBehavior: false}, () => {
            pages.investorHomeActions.verifyBottomQuestions()
            pages.investorHomeActions.verifyHelpCenterButton()
        });
    })

})