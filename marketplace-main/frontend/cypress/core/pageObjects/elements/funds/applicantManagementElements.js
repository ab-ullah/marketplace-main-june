const applicantTableRow = 'div[aria-rowindex="2"]'
const actionDotIcon = '.sc-carFqZ > .MuiSvgIcon-root'
const subActionsLink = 'div.MuiPopover-paper a'
const filterInput = 'input[placeholder=Filter]'
const fundTitleHeader = 'h1[class*=sc]'
// Edit Modal
const editSubActionLocator = '.MuiPaper-root > :nth-child(4)'
const editSubActionLocatorNotApproved = '.MuiPaper-root > :nth-child(5)'
const vehicleOptionDropdown = ':nth-child(10) > :nth-child(1) > .mt-2 > :nth-child(2) > :nth-child(1) > .sc-fXazdy > .select__control > .select__value-container'
//':nth-child(10) > :nth-child(1) > .mt-2 > :nth-child(2) > :nth-child(1) > .sc-FRrlG > .select__control > .select__indicators > .select__indicator > .css-8mmkcg'
// Share class
const shareclass = ':nth-child(2) > .mt-2 > :nth-child(2) > :nth-child(1) > .sc-fXazdy > .select__control > .select__value-container'
//':nth-child(2) > .mt-2 > :nth-child(2) > :nth-child(1) > .sc-FRrlG > .select__control'
const investorAccountCodeInput = 'input[name=investor_account_code]'
// Approval
const approveLink = ".MuiPaper-root > :nth-child(2)"
const viewLink = ".MuiPaper-root > :nth-child(2)"
// Application Details
const requestDocNameInput = 'input[name=document_name]'
const requestDocDescriptionInput = 'textarea[name=document_description]'
const addDocumentRequest = '.sc-icoqBx > :nth-child(3)'
//".sc-czNxle > :nth-child(3)"
const addRequestDocSveButton = ".sc-hacVJK > .btn-primary"
const adminDocumentVerification = ".mb-1 > :nth-child(3) > :nth-child(1)"
const editApplicantSaveButton = ".sc-iBzEeX > .btn-primary"

const applicantManagementElements = {
    applicantTableRow,
    actionDotIcon,
    subActionsLink,
    filterInput,
    fundTitleHeader,
    vehicleOptionDropdown,
    investorAccountCodeInput,
    requestDocNameInput,
    requestDocDescriptionInput,
    editSubActionLocator,
    approveLink,
    shareclass,
    viewLink,
    addDocumentRequest,
    addRequestDocSveButton,
    adminDocumentVerification,
    editApplicantSaveButton,
    editSubActionLocatorNotApproved
}

module.exports = applicantManagementElements