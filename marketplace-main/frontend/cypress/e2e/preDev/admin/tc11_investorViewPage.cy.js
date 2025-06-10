import * as pages from '../../../core/pageObjects/pages'

describe('TC11 Investor View Page Test', () => {

    before(() => {
        pages.generalActions.loginAdminUser()
    })

    it('Click on Fund with Status Applicant Review', () => {
        pages.homeActions.clickOnApplicantReviewFund()
    })

    it('Navigate to Applicant Management Tab for the Fund', () => {
        pages.applicantManagementActions.clickOnApplicantManagementTab()
    })

    it('Verify Header Title and Applicant Row', () => {
        pages.applicantManagementActions.verifyHeaderTitle()
        pages.applicantManagementActions.verifyApplicantRecordInTable()
    })

    it('Click on Action Icon and View Option', () => {
        pages.applicantManagementActions.clickOnActionsDotIcon()
        pages.applicantManagementActions.clickOnViewSubActionLink()
    })

    it('Verify Investor View Page Titles', () => {
        pages.applicantManagementActions.verifyInvestorViewPageTitles()
    })

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    })

})