const firstTableCol = 'td > a'
const myTaskfirstTableCol = 'tbody > :nth-child(1) > :nth-child(1)'
const firstTableRow = 'tbody > tr'
const tableDataCol = 'tbody > tr > td'
const recentTab = 'button#my-tasks-tab-tab-recent'
const completedTab = 'button#my-tasks-tab-tab-completed'
// My Tasks Review Page
const modalTitle = '.modal-title'
const popupCloseButton = '.modal-footer button[type=button]'
const popupCloseIcon = '.modal-header button[type=button]'
const logicViewTabButton = 'button[data-rb-event-key=logic]'
const previewTabButton = 'button[data-rb-event-key=preview]'
const commentTextAreaInput = 'textarea[class*=textArea__input]'
const addCommentButton = '.textArea + div > button[type=button]'
const requestRevisionsButton = 'button[class*=outline-danger]'
const approveButton = 'button[class*=outline-danger] + button'
// My Tasks Details Page
const flagIconSpan = ".sc-fpqIuI > :nth-child(6) > :nth-child(2) > .sc-cOohKt"
//'div.row div > div > div:nth-child(3) > span'
const createRequestModalTextarea = 'div.modal-body > textarea'
const createRequestModalSendButton = 'div.modal-body button.btn-primary'
const approveButtonForFlag = 'div.row > div > div > div:nth-child(2) > button.btn-primary'
//Request Revision
const firstNameClick = '.sc-fpqIuI > :nth-child(6) > :nth-child(2) > .sc-cOohKt'
//'.sc-dVSYCO > :nth-child(6) > :nth-child(2) > .sc-gwWxmB'
const revisionInput = '.sc-eqLmJG'
const modalSend = '.sc-enTqHk'
const requestRevision = ".btn-outline-danger"
const revisionAlert = ".modal-body"
const clickOnApprove = '.sc-hZpJwi'
const clickonApproveButton = '.sc-icoqBx > .btn-primary'
//'.sc-czNxle > .btn-primary'
const jobTitle = ".sc-dVSYCO > :nth-child(10) > :nth-child(2) > .sc-gwWxmB"
const phoneNumber = ":nth-child(21) > .sc-iLCGUA > :nth-child(3) > :nth-child(2) > :nth-child(1) > .sc-gwWxmB"
const kycNewRequest = ".sc-fnebDD > .sc-gBsxbr"
const contrychangeRequest = ":nth-child(3) > :nth-child(2) > .sc-gwWxmB"
//const myTaskfirstTableCol = 'tbody > :nth-child(1) > :nth-child(1)'

const myTasksElements = {
    firstTableCol,
    myTaskfirstTableCol,
    firstTableRow,
    tableDataCol,
    recentTab,
    completedTab,
    modalTitle,
    popupCloseButton,
    popupCloseIcon,
    logicViewTabButton,
    previewTabButton,
    commentTextAreaInput,
    addCommentButton,
    requestRevisionsButton,
    approveButton,
    flagIconSpan,
    createRequestModalTextarea,
    createRequestModalSendButton,
    approveButtonForFlag,
    firstNameClick,
    revisionInput,
    modalSend,
    requestRevision,
    revisionAlert,
    clickOnApprove,
    clickonApproveButton,
    jobTitle,
    phoneNumber,
    kycNewRequest,
    contrychangeRequest,
    myTaskfirstTableCol


}

module.exports = myTasksElements