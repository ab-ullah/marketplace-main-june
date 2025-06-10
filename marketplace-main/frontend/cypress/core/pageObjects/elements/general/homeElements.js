const createFundButton = 'button[type=button]'
const titleHeader = '.navbar-brand'
const fundsListTable = '.table-container'
const logoutButton = '.navbar-nav path'
const tableFundsListColLink = 'div[aria-colindex="1"] a'
const fundsLinkInHeader = 'a[href="/admin/funds"]'
const actionsDotOptionsElem = 'div[role=row] .MuiSvgIcon-root'
const actionModalDiv = 'div.MuiPaper-root'
const actionModalOptions = 'div.MuiPaper-root>a:nth-child(2)'
const publishOpportunityOption = 'div.MuiPaper-root>a:nth-child(3)'
const modalTitle = '.modal-title'
const modalBody = '.modal-body'
const editFundDocumentLink = 'div[aria-colindex="7"] a'
const companyHeaderLink = 'a[href="/admin/company"]'
const filterInputBar = 'input[placeholder=Filter]'
const filteredFund = 'div[aria-rowindex="2"]'
const searchinput = '.sc-eCApnc'
const firstfund = '[aria-rowindex="2"] > .rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content > .rs-table-cell-wrap > .sc-jgPyTC'
//"[aria-rowindex=2] > .rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content > .rs-table-cell-wrap > .sc-hTRkXV"
const tasklinkonheader = '.sc-hzUIXc > a'
// Edit Fund Doc Modal
const selectDocButton = 'button.select-button'
const fileUploadInput = 'input[type=file]'
const deleteFileIcon = 'img[alt=Delete]'
const requireSignCheckbox = 'input[value=require_signature]'
const requireGPSignCheckbox = 'input[value=require_gp_signature]'
const docNameSpan = 'span.doc-name'
const dropdownInput = '.select__control'
const closeModalButton = 'button.btn-close'
const documentSpan = ".sc-bqGGPW"
const deleteIcon = '[src="/static/media/delete-icon.3011c5d0.svg"]'
const requiredSignatureCheckBox = 'input[type="checkbox"][value="require_signature"]'

const homeElements = {
    createFundButton,
    titleHeader,
    fundsListTable,
    logoutButton,
    tableFundsListColLink,
    fundsLinkInHeader,
    actionsDotOptionsElem,
    actionModalDiv,
    actionModalOptions,
    publishOpportunityOption,
    modalTitle,
    modalBody,
    editFundDocumentLink,
    companyHeaderLink,
    filterInputBar,
    filteredFund,
    searchinput,
    tasklinkonheader,
    firstfund,
    selectDocButton,
    fileUploadInput,
    deleteFileIcon,
    requireSignCheckbox,
    requireGPSignCheckbox,
    docNameSpan,
    dropdownInput,
    closeModalButton,
    documentSpan,
    deleteIcon,
    requiredSignatureCheckBox
}

module.exports = homeElements