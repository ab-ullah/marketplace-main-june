import * as pages from '../../../core/pageObjects/pages'

describe("TS1: Investor Homepage Element/ Lables", () => {

    before(() => {
        pages.generalActions.loginInvestorUser()
    })

    it("TC1: Verify Welcome Text & Investor URL", () => {
        pages.investorHomeActions.verifyInvestorHomeUrl()
        pages.investorHomeActions.verifyWelcomeHeaderTitle()
    })
    it("TC2: Verify Heading-Application in Progress Text", () => {
        pages.investorHomeActions.verifyApplicationProgesstext()
    })
    it("TC3: Verify Fund Listing Table Title", () => {
        pages.investorHomeActions.verifyHeaderTitleText()
    })
    it("TC4: Verify Bottom Block-Questions", () => {
        pages.investorHomeActions.verifyBottomQuestions()
    })
    it("TC5: Verify Support Email is Displaying on Home & Contact Page", () => {
        pages.investorHomeActions.verifySupportMail()
    })
    it("TC6: Verify Contact Support Text", () => {
        pages.investorHomeActions.verifyBottomQuestions()
    })
    it("TC7: Verify Visit our Help Center button", () => {
        pages.investorHomeActions.verifyHelpCenterButton()
    })
    it("TC8: Verify Footer Section is Properly Displaying", () => {
        pages.investorHomeActions.verifyFooterSection()
    })
    it("TC9: Verify Counters e.g Applicant, Opportunities, Active Investment", () => {
        pages.investorHomeActions.verifyCountersOnHome()
    })
    it("TC10: Verify Counter's Links are Working Fine", () => {
        pages.investorHomeActions.verifyCountersOnHome1()
    })
    it("TC11: Verify Header is Displaying Fine", () => {
        pages.investorHomeActions.verifyHeaderSection()

    })

    after(() => {
        pages.investorHomeActions.logoutUser()
    })




})