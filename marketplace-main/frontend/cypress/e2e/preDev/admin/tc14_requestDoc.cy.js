import * as pages from '../../../core/pageObjects/pages'

describe('TC14 Add Request Document Test', () => {

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

    it('Click on Add Request Doc Button', () => {
        pages.applicantManagementActions.clickOnAddDocRequestButton()
    })

    it('Type Request Doc Name and Input and Save', () => {
        pages.applicantManagementActions.addRequestDocNameAndDescription()
        pages.applicantManagementActions.clickOnSaveButton()
    })

    after(() => {
        pages.homeActions.clickOnLogoutButton()
    })

})