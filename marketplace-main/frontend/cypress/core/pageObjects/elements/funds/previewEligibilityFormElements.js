const backToEditButton = 'button.btn-back-to-edit'
const submitReviewButton = 'a+button[type=button]'
const startPreviewButton = 'div > h1+button[type=button]'
const headerTitleText = 'div > h1'
// Preview Form Elements Step 1
const backButton = 'button.btn-back'
const nextButton = 'button[type=submit]'
const dropdownInput = 'form .select__control' //for all dropdown inputs on the page
const firstNameInput = 'input[name=firstName]'
const lastNameInput = 'input[name=lastName]'
const jobTitleInput = 'input[name=jobTitle]'
const previewSuccessMessage = 'h6'
// Preview Form Elements Step 2 - Accredited Form
const accreditedRadioOption1 = 'label[for=accredited-0]'
const certifyCheckbox = '.sc-aiooD > #accredited-0'
//".sc-zHacW > #accredited-0"
const accreditedRadioOption2 = 'label[for=accredited-2]'
const accreditedRadioOption4 = 'label[for=accredited-4]'
// Preview Form Elements Step 3 - Knowledgeable Emp
const keRadioOption1 = 'label[for=KE-Options-0]'
// Preview Form Elements Step 4 - Upload Doc
const selectDocButton = 'button.select-button'
const fileUploadInput = 'input[type=file]'
const fileUploadInputSecond = ":nth-child(3) > .container > .sc-cpUASM > .select-button"
const filenameSpan = 'div > span'
const deleteFileIcon = 'img.deleteImg'
// Submit For Review Elements
const cancelButton = '.modal-footer > button:nth-child(1)'
const sendButton = '.modal-footer > button:nth-child(2)'
const reviewerDropdownInput = 'form .select__control'
const successTitle = 'h4'
const successMessageBody = 'h4+p'
// Investor Preview Form - Equity Verification Form
const equityInput = 'input[type=text]'
const errorDiv = 'div.errorText'
const eligibilityLimitLink = 'span > a'
const noneRadioBtn = 'label[for="[object Object]-none"]'
const threeRatioRadioBtn = 'label[for="[object Object]-3:1"]'
const fourRatioRadioBtn = 'label[for="[object Object]-4:1"]'
const equityBar = 'div.bar-item-0'
const equityBarValue = 'div.bar-item-0 > span:nth-child(2)'
const leverageBarValue = 'div.bar-item-1 > span:nth-child(2)'
// Preview Form - Final
const goToMyApplicationBtn = 'a.btn-purple'
const investmentCountry = '.mb-2 .field-label[for="entityType"]'
const qualifiedPurchaseOption = "#US-QP-Options-0"




const previewEligibilityFormElements = {
    backToEditButton,
    submitReviewButton,
    startPreviewButton,
    headerTitleText,
    backButton,
    nextButton,
    dropdownInput,
    firstNameInput,
    lastNameInput,
    jobTitleInput,
    previewSuccessMessage,
    accreditedRadioOption1,
    accreditedRadioOption2,
    accreditedRadioOption4,
    keRadioOption1,
    selectDocButton,
    fileUploadInput,
    filenameSpan,
    deleteFileIcon,
    cancelButton,
    sendButton,
    reviewerDropdownInput,
    successTitle,
    successMessageBody,
    equityInput,
    errorDiv,
    eligibilityLimitLink,
    noneRadioBtn,
    threeRatioRadioBtn,
    fourRatioRadioBtn,
    equityBar,
    equityBarValue,
    leverageBarValue,
    goToMyApplicationBtn,
    investmentCountry,
    qualifiedPurchaseOption,
    fileUploadInputSecond,
    certifyCheckbox
}

module.exports = previewEligibilityFormElements