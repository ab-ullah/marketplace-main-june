import * as pages from '../../../core/pageObjects/pages'

describe('TC06 Add Fund Document Suite', () => {

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

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('Edit Fund Document', () => {

        before(() => {
            pages.generalActions.loginAdminUser()
        })

        it('Click on Edit Fund Document Link', () => {
            pages.homeActions.clickOnEditFundDocumentLink()
        })

        it('Verify Modal Title and Upload File', () => {
            pages.homeActions.verifyModalTitleIsDisplayed()
            pages.homeActions.uploadFundTemplate()
        })

        it('Verify Doc Uploaded Successfully and Mark Checkboxes', () => {
            pages.homeActions.verifyFundTemplateUpload()
            pages.homeActions.clickRequiredCheckboxesOnModal()
            pages.homeActions.selectGPSignerFromDropdown()
        })

        it('Close Modal', () => {
            pages.homeActions.clickOnCloseModalButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })
    })

})