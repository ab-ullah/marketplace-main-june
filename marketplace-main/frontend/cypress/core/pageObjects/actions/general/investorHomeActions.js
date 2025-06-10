/// <reference types= "cypress" />
import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'

const fundTitle = pages.createFundActions.exportFundTitle().toString()
const getText = pages.homeActions.getLatestFundID()

const verifyInvestorHomeUrl = () => {
    pages.generalActions.verifyUrl('/investor/start')
}

const verifyHeaderTitleText = () => {
    pages.generalActions.getElementUsingLabel(labels.investorHomeLabels.investmentOpportunitiesLabel).should('be.visible')
}

const verifyWelcomeHeaderTitle = () => {
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.headerTitleText).should('be.visible')
}

const verifyCountersOnHome = () => {
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.applicationsCounter).should('be.visible')
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.opportunitiesCounter).should('be.visible')
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.activeInvestmentCounter).should('be.visible')
}

const verifyBottomQuestions = () => {
    pages.generalActions.getElementUsingLabel(labels.investorHomeLabels.programOfferingQuestion).should('be.visible')
    pages.generalActions.getElementUsingLabel(labels.investorHomeLabels.applicationProcessQuestion).should('be.visible')
}

const verifyHelpCenterButton = () => {
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.helpCenterButton).should('be.visible')
}

const logoutUser = () => {
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.navbarDropdown)
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.signOutLink)
}

const verifyApplyLinkIsNotDisplayed = () => {
    pages.generalActions.verifyElementsText(elements.investorHomeElements.fundTableCellDiv, fundTitle).parents(elements.investorHomeElements.fundRowParentDiv).then(elem => {
        const parentRow = elements.investorHomeElements.fundRowApplyLinkPreString + elem[0].ariaRowIndex + '"]'
        pages.generalActions.getElementUsingLocator(parentRow).should('not.contain', labels.investorHomeLabels.applyNowLinkLabel)
    })
}

const clickOnApplyLink = () => {
    pages.generalActions.verifyElementsText(elements.investorHomeElements.fundTableCellDiv, fundTitle).parents(elements.investorHomeElements.fundRowParentDiv).then(elem => {
        const parentRow = elements.investorHomeElements.fundRowApplyLinkPreString + elem[0].ariaRowIndex + '"]'
        //pages.generalActions.getElementUsingLocator(parentRow).contains(labels.investorHomeLabels.applyNowLinkLabel).invoke('removeAttr', 'target').click()
        pages.generalActions.getElementUsingLocator(parentRow).contains(labels.investorHomeLabels.applyNowLinkLabel).then(link => {
            pages.generalActions.visitLink(link[0].dataset.applyLink)
        })
    })
}

const clickOnApplicationArrowButton = () => {
    pages.generalActions.clickNthButtonUsingLocator(elements.investorHomeElements.arrowButtonInApplication, 0)
}
const clickOnapplicationinprogress1st = () => {
    pages.generalActions.clickNthButtonUsingLocator(elements.investorHomeElements.applicationinpgroress, 0)
}
const verifyApplicationProgesstext = () => {
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.applicationprogresstext).should('be.visible')
}
const verifySupportMail = () => {
    pages.generalActions.getElementUsingLabel(labels.investorHomeLabels.supportmail).should('be.visible')
}
const verifyContactSupport = () => {
    pages.generalActions.getElementUsingLabel(labels.investorHomeLabels.contactsupport).should('be.visible')
}
const verifyFooterSection = () => {
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.footersection).should('be.visible')
}
const verifyHeaderSection = () => {
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.headersection).should('be.visible')
}
const verifyCountersOnHome1 = () => {
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.applicationsCounter).should('be.visible').click()
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.opportunitiesCounter).should('be.visible').click()
    pages.generalActions.getElementUsingLocator(elements.investorHomeElements.activeInvestmentCounter).should('be.visible').click()
}
const verifyChangesRequestedLabelOnTile = () => {

    pages.generalActions.verifyFieldValue(elements.investorHomeElements.changesRequest, labels.investorHomeLabels.changesRequestLabel)

}
const verifyYellowChangesRequestedTile = () => {

    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.orangeChangesRequestedTile)

}
const verifykycChangesRequestedLabelOnTile = () => {

    pages.generalActions.verifyFieldValue(elements.investorHomeElements.kycorangeChangesRequestedTile, labels.investorHomeLabels.changesRequestLabel)
}
const fillOutRevision = () => {

    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.leftYellowFlag)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.fieldYellowFlag)
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.replyButton)
    pages.generalActions.typeInInput(elements.investorHomeElements.revisionInput, labels.investorHomeLabels.revisionInputInvestor)
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.closeButton)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.dateVerification)


}
const kycamlfillOutRevision = () => {

    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.kycNewRequest)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.inputNeededClick)
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.kycreplyButton)
    pages.generalActions.typeInInput(elements.investorHomeElements.revisionInput, labels.investorHomeLabels.revisionInputInvestor)
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.closeButton)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.dateVerification)


}
const deleteTaxForm = () => {
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.deleteFirstTaxForm)
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.deleteSecondTaxForm)
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.deleteThirdTaxForm)

}
const revisionDocumentVerification = () => {
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.documentNewRequestLabel)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.documentNewRequestLabelField)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.documentUploadBox)
}
const uploadRevisionDocument = () => {
    pages.generalActions.uploadFileUsingLocator(elements.investorHomeElements.uploadDocumentRevision, Cypress.env('company_logo_path'))
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.uploadedFileVerification)

}
const verifyApplicationinProgressSection = () => {
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.applicationinpgroressHeading)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.applicationinpgroressdiv)

}
const verifyInvestmentOpportunitySection = () => {
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.investmentOpportunitiesHeading)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.investmentOpportunitiesDiv)

}
const verifyInvestmentOpportunityHeader = () => {
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.fundsColumn)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.regionsColumn)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.typeColumn)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.riskProfileColumn)
    pages.generalActions.verifyElementOnPage(elements.investorHomeElements.applicationPeriodColumn)

}
const redirectToFundListingPage = () => {
    pages.generalActions.clickButtonUsingLocator(elements.investorHomeElements.redirectToFundsListing)
}


const investorHomeActions = {
    verifyInvestorHomeUrl,
    verifyHeaderTitleText,
    verifyWelcomeHeaderTitle,
    verifyCountersOnHome,
    verifyBottomQuestions,
    verifyHelpCenterButton,
    logoutUser,
    verifyApplyLinkIsNotDisplayed,
    clickOnApplyLink,
    clickOnApplicationArrowButton,
    verifyApplicationProgesstext,
    verifySupportMail,
    clickOnapplicationinprogress1st,
    verifyContactSupport,
    verifyFooterSection,
    verifyHeaderSection,
    verifyCountersOnHome1,
    fillOutRevision,
    verifyChangesRequestedLabelOnTile,
    verifyYellowChangesRequestedTile,
    kycamlfillOutRevision,
    verifykycChangesRequestedLabelOnTile,
    deleteTaxForm,
    revisionDocumentVerification,
    uploadRevisionDocument,
    verifyApplicationinProgressSection,
    verifyInvestmentOpportunitySection,
    verifyInvestmentOpportunityHeader,
    redirectToFundListingPage

}

export default investorHomeActions