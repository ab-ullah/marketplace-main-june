const titleHeader = 'h1'
const bankLocated = ".select__value-container"
// old ":nth-child(1) > .basic-single > .select__control > .select__value-container"
const bankName = "input[name=bank_name]"
const bankSwift = "input[name=swift_code]"
const bankIntermediarycheckbox = "input[type=checkbox]"
const bankIntermediaryname = "input[name=intermediary_bank_name]"
const bankIntermediarySwiftCode = "input[name=intermediary_bank_swift_code]"
const bankIntermediarycheckboxLabel = "label[class=form-check-label]"
const IntermediaryBankName = "input[name=intermediary_bank_name]"
const IntermediaryBanSwift = "input[name=intermediary_bank_swift_code]"

const streetAddress = "input[name = street_address]"
const city = "input[name = city]"
const province = " input[name = province]"
const postalCode = "input[name = postal_code]"
const accountName = "input[name = account_name]"
const accountNumber = "input[name = account_number]"
const ibanNumber = "input[name = iban_number]"
const creditAccountName = "input[name = credit_account_name]"
const creditAccountNumber = "input[name = credit_account_number]"
const reference = "input[name=reference]"
const currency = ':nth-child(13) > .basic-single > .select__control > .select__value-container'
//old ":nth-child(12) > .basic-single > .select__control > .select__value-container"
':nth-child(13) > .basic-single > .select__control > .select__value-container'
const submitButton = ".sc-geBCVM"

//Power of attorney
const powerofAttorneyEyeIcon = ".file-tag > :nth-child(2)"
const CloseButtonProgramDocument = ".sc-gswFgi > :nth-child(2)"
const downloadModalButtonProgrameDocument = ".sc-gswFgi > :nth-child(1)"
//old ".sc-fJxALz > :nth-child(2)"

const clickOnNextButton = ".sc-geBCVM"
const iObjectDropdown = "select[class=form-control]"

//Review Documents
const acknowledgeText = ".mt-5"
const documentPreview = ".file-tag > .MuiSvgIcon-root > path"
const closeButtononModalReviewDocument = ".sc-gswFgi > :nth-child(2)"
//old '.sc-fJxALz > :nth-child(2)'
const downloadIconReviewDocument = '.download-icon'
const agreeCheckBox = '.form-check'
const agreementCheckBox = 'input[class=form-check-input]'
const nextButtonRviewDocument = ".mt-4"

//Last Page
const goToMyApplicationButton = ".mb-2"
const pageDescription = ".mt-5"
const redirectToApplication = ".sc-hQYpqk"
//".sc-bTJQgd"

const myBankDetailElement = {
    titleHeader,
    bankLocated,
    bankName,
    bankSwift,
    bankIntermediarycheckbox,
    bankIntermediarycheckboxLabel,
    IntermediaryBankName,
    IntermediaryBanSwift,
    streetAddress,
    city,
    province,
    postalCode,
    accountName,
    accountNumber,
    ibanNumber,
    creditAccountName,
    creditAccountNumber,
    reference,
    currency,
    submitButton,
    bankIntermediaryname,
    bankIntermediarySwiftCode,
    powerofAttorneyEyeIcon,
    clickOnNextButton,
    acknowledgeText,
    documentPreview,
    closeButtononModalReviewDocument,
    downloadIconReviewDocument,
    agreeCheckBox,
    agreementCheckBox,
    nextButtonRviewDocument,
    goToMyApplicationButton,
    pageDescription,
    iObjectDropdown,
    redirectToApplication,
    CloseButtonProgramDocument,
    downloadModalButtonProgrameDocument

}

module.exports = myBankDetailElement