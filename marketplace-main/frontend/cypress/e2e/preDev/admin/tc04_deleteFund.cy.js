import * as pages from '../../../core/pageObjects/pages'

describe('TC04 Delete Fund Suite', () => {

    context('Create Fund', () => {

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
        })

        it('Delete Fund', { scrollBehavior: false }, () => {
            pages.createFundActions.clickOnDeleteFundButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

})