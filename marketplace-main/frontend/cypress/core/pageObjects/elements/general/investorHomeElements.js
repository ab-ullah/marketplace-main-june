const navbarDropdown = 'div.dropdown button'
const signOutLink = 'div.dropdown > div a:nth-child(4)'
const fundTableCellDiv = '.sc-iMCRTP > :nth-child(3)'
//    '.sc-hgRTRj > :nth-child(3)'
//".sc-juNJA-d > :nth-child(3)"
//".sc-dYCqDv"
//old div '.sc-dPzuq'
const fundRowParentDiv = 'div[role=row]'
const fundRowApplyLinkPreString = 'div[aria-rowindex="'
const fundRowApplyLinkPostString = '"] > div:nth-child(2) a'
const headerTitleText = 'h1'
const applicationsCounter = '.right-border:nth-child(1)'
const opportunitiesCounter = '.right-border:nth-child(2)'
const activeInvestmentCounter = '.right-border:nth-child(2) + div'
const helpCenterButton = 'a.btn-primary'
const arrowButtonInApplication = 'div.button-div'
const applicationinpgroress = "div.button-div"
//old path ":nth-child(1) > .sc-cCwPlL > .lower-div > .button-div > .sc-ljpcbl"
//old path ":nth-child(1) > .sc-kMGnOH > .lower-div > .button-div > .sc-hBezlf"
const applicationprogresstext = 'h4'
const footersection = "footer.fKNeAN"
const headersection = "nav.navbar"
const supportmail = ".sc-czNxle > :nth-child(1) > :nth-child(3) > a"
//Revision
const leftYellowFlag = ".sc-gggoXN"
//old '.sc-gBsxbr'
const fieldYellowFlag = '.sc-JsfZP'
const replyButton = '.sc-jhGUec'
const revisionInput = '.modal-body > form > div > .form-control'
const closeButton = '.modal-footer > .btn-primary'
const dateVerification = '.sc-dksuTV > div > p'
const changesRequest = ":nth-child(1) > .sc-cCwPlL > :nth-child(2) > .changes-requested"
// old ":nth-child(1) > .sc-kMGnOH > :nth-child(2) > .changes-requested"
const orangeChangesRequestedTile = ".sc-gggoXN"
//old '.sc-eYKchh'
const kycNewRequest = ".eNxVUV > .sc-gggoXN"
//old ".sc-fnebDD > .sc-gggoXN"
const kycorangeChangesRequestedTile = ':nth-child(1) > .sc-cCwPlL > :nth-child(2) > .changes-requested'
const inputNeededClick = ".action"

const kycreplyButton = 'form > .sc-cGKJhA > .sc-gGGFjW > .sc-jhGUec'

const deleteFirstTaxForm = ":nth-child(11) > .sc-jhDJEt > .sc-iuImSO > .MuiSvgIcon-root"
const deleteSecondTaxForm = ":nth-child(12) > .sc-jhDJEt > .sc-iuImSO > .MuiSvgIcon-root"
const deleteThirdTaxForm = ":nth-child(13) > .sc-jhDJEt > .sc-iuImSO > .MuiSvgIcon-root"
//Doc Revision
const documentNewRequestLabel = '.sc-fkmfBh > .sc-gggoXN'
const documentNewRequestLabelField = ".sc-gBsxbr > .sc-gggoXN"
const documentUploadBox = ".MuiDropzoneArea-root"
const uploadDocumentRevision = 'input[type=file][accept="image/*,application/pdf,application/msword"]'
const uploadedFileVerification = ".col > .sc-iuImSO > .sc-ByBTK"
//Investor Home
const applicationinpgroressHeading = ":nth-child(1) > .sc-hgRTRj"
const applicationinpgroressdiv = ".sc-bOKJCu"

const investmentOpportunitiesHeading = ":nth-child(3) > .sc-hgRTRj"
const investmentOpportunitiesDiv = ".sc-juNJA-d > :nth-child(3)"

//Opportunity Table
const fundsColumn = ".rs-table-cell-group > :nth-child(1) > .rs-table-cell > .rs-table-cell-content"
const regionsColumn = ":nth-child(2) > .rs-table-cell > .rs-table-cell-content"
const typeColumn = ":nth-child(3) > .rs-table-cell > .rs-table-cell-content"
const riskProfileColumn = ":nth-child(4) > .rs-table-cell > .rs-table-cell-content"
const applicationPeriodColumn = ":nth-child(5) > .rs-table-cell > .rs-table-cell-content"
const redirectToFundsListing = ":nth-child(1) > .sc-ckTSus"
//":nth-child(1) > .sc-jffHpj"




const investorHomeElements = {
    navbarDropdown,
    signOutLink,
    kycorangeChangesRequestedTile,
    kycNewRequest,
    fundTableCellDiv,
    fundRowParentDiv,
    fundRowApplyLinkPreString,
    fundRowApplyLinkPostString,
    headerTitleText,
    applicationsCounter,
    opportunitiesCounter,
    activeInvestmentCounter,
    helpCenterButton,
    arrowButtonInApplication,
    applicationinpgroress,
    supportmail,
    footersection,
    headersection,
    applicationprogresstext,
    leftYellowFlag,
    fieldYellowFlag,
    replyButton,
    revisionInput,
    closeButton,
    dateVerification,
    changesRequest,
    orangeChangesRequestedTile,
    inputNeededClick,
    kycreplyButton,
    deleteFirstTaxForm,
    deleteSecondTaxForm,
    deleteThirdTaxForm,
    documentNewRequestLabel,
    documentNewRequestLabelField,
    documentUploadBox,
    uploadDocumentRevision,
    uploadedFileVerification,
    applicationinpgroressHeading,
    applicationinpgroressdiv,
    investmentOpportunitiesHeading,
    investmentOpportunitiesDiv,
    fundsColumn,
    regionsColumn,
    typeColumn,
    riskProfileColumn,
    applicationPeriodColumn,
    redirectToFundsListing

}

module.exports = investorHomeElements