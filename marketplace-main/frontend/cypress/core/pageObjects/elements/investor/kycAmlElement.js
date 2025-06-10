const kycDateofBirth = "input[name=date_of_birth]"
const kycEmail = 'input[name=email]'
const kycPhoneNumber = "input[name=phone_number]"
const kycCurrentEmployee = ":nth-child(5) > .mt-2 > .col-md-8 > .row > .rkGHX > label"
const kycCuurentEmployeeRadio = ':nth-child(5) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu'
const kycCuurentEmployeeRadioIN = ":nth-child(5) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu"
const kycUSpersonRadio = ":nth-child(6) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const kycUSpersonRadioIN = ":nth-child(6) > .mt-2 > .col-md-8 > .row > .gMzSTu > .sc-fyGvY"
const kycWhollyOwnedRadio = ":nth-child(7) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const kycDirectParentRadio = ":nth-child(8) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const kycSpecificPurposeRadio = ":nth-child(9) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const kycUSperson = ":nth-child(6) > .mt-2 > .col-md-8 > .row > .rkGHX > label"
const kycNetWorth = "input[name=net_worth]"
const kycCountryofCitizenship = ":nth-child(11) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
//":nth-child(8) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const kycCountryofCitizenshipSelect = ".select__value-container"
const kycCountryofCitizenshipIn = ":nth-child(8) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container"
const kycOfficeLocation = ":nth-child(9) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const kycOfficeLocationcop = ":nth-child(12) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const headerTitleText = 'h1'
const kycPoliticallyExposed = ":nth-child(10) > .mt-2 > .col-md-8 > .row > .rkGHX > label"
const kycPoliticallyExposedRadio = ":nth-child(10) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const kycPoliticallyExposedRadiocop = ":nth-child(13) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"

const kycSourceofFunds = ":nth-child(11) > .mt-2 > .col-md-8 > .row > .rkGHX > label"
const kycSourceofFundRadio = ':nth-child(11) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit'
//":nth-child(13) > .mt-2 > .col-md-8 > .row > :nth-child(2) > .sc-fxFQKN > .sc-fyGvY"

const kycEconomicBeneficiary = ":nth-child(12) > .mt-2 > .col-md-8 > .row > .rkGHX > label"
const kycSourceofFundRadiocop = ":nth-child(14) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const kycEconomicBeneficiaryIN = ":nth-child(12) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"

const kycEconomicBeneficiarycop = ":nth-child(15) > .mt-2 > .col-md-8 > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const kycEconomicBeneficiaryRadio = ":nth-child(14) > .mt-2 > .col-md-8 > .row > :nth-child(1) > .sc-fxFQKN > .sc-fyGvY"

const kycEconomicBeneficiaryRadioIn = ":nth-child(12) > .mt-2 > .col-md-8 > .row > .rkGHX > .sc-fxFQKN"

const kycpurposeofSubscription = ":nth-child(3) > .row > .rkGHX > label"
const kycpurposeofSubscriptionRadio = ":nth-child(3) > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"

const kycDOBFieldsLabel = ":nth-child(2) > .mt-2 > .field-label"
const kycEmailLabel = ":nth-child(3) > .mt-2 > .field-label"
const kycPhoneNumberLabel = ":nth-child(4) > .mt-2 > .field-label"
const kycCurrentEmployeeLabel = ':nth-child(5) > .mt-2 > .field-label'
const kycUSPersonInvestingLabel = ':nth-child(6) > .mt-2 > .field-label'
const kycNetWorthLabel = ':nth-child(7) > .mt-2 > .field-label'
const kycCountryofCitizenShipLabel = ':nth-child(8) > .mt-2 > .field-label'
const kycOfficeLocationLabel = ':nth-child(9) > .mt-2 > .field-label'
const kycPloticallyExposedPersonLabel = ':nth-child(10) > .mt-2 > .field-label'
const kycSourceofFundsLabel = ':nth-child(11) > .mt-2 > .field-label'
const kycEconomicsBeneficiaryLabel = ':nth-child(12) > .mt-2 > .field-label'
const kycPurposeofSubscriptionLabel = ':nth-child(13) > .mt-2 > .field-label'
const kycHeaderPersonalInformationLabel = '.sc-gVtoEh'
//".sc-EhTUr"
//".sc-hGwcmR"
//Next Button
const clickOnNextButton = ".sc-gGuRsA"
const clickOnNextButtonCE = ".sc-kHVIJG"

//Home address
const kycHomeAddressLabel = ".sc-gVtoEh"
const kycHomeAdrressCountry = ':nth-child(3) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const kycHomeAdrressCountrySelect = ".select__value-container"
const kycHomeAddressAddress = ":nth-child(4) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycHomeAddressCity = ":nth-child(5) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycHomeAddressState = ":nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const kycHomeAddressStateSelect = ":nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container"
const kycHomeAddressZip = ":nth-child(7) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycRegion = 'input[name="home_region"]'
const kycPostalCode = 'input[name="home_zip"]'
//Home addrss labels
const kycHomeAdrressCountryLabel = ":nth-child(3) > .mt-2 > .field-label"
const kycHomeAddressAddressLabel = ":nth-child(4) > .mt-2 > .field-label"
const kycHomeAddressCityLabel = ":nth-child(5) > .mt-2 > .field-label"
const kycHomeAddressStateLabel = ":nth-child(6) > .mt-2 > .field-label"
const kycHomeAddressZipLabel = ":nth-child(7) > .mt-2 > .field-label"
const nextButtonHomeAddress = '.sc-cjzNjn'
//Upload Documnets
const uploadDocumentID = ':nth-child(8) > .mt-2 > .col-md-8 > .sc-liAPKD'
//":nth-child(9) > .mt-2 > .col-md-8 > .sc-gVtoEh"
// ":nth-child(9) > .mt-2 > .col-md-8 > .sc-EhTUr"
const uploadDocumentIDCE = ":nth-child(9) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
const uploadDocumentIDCE2nd = ":nth-child(3) > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
const uploadDocumentIDCE2ndClick = ":nth-child(3) > .sc-liAPKD"
//":nth-child(3) > .sc-EhTUr"

const chooseFile = ".sc-iuImSO"
//".sc-dbXCOC"
const issuingCountry = ":nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const issuingCountrySelect = ':nth-child(4) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//":nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container"
const IDdocumentType = ":nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const IDdocumentTypeSelect = ':nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//":nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container"
const IDexpiration = ".col-md-8 > .form-control"
const IdentificationNumber = "#formFilterValue"
const proofofAddress = ".field-help-text > span"
const filenameSpan = ":nth-child(9) > .mt-2 > .col-md-8 > .sc-iuImSO"
const deleteFileIcon = ":nth-child(3) > .sc-iuImSO > .sc-fTFMiz"
const backButtonUploadFile = ".sc-biHcxt"
//Corporate Entity
const kycYourEntity = ":nth-child(3) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycTitleofSigning = ":nth-child(4) > .mt-2 > .col-md-8 > :nth-child(1) > #formFilterValue"
const kycDateOfFormation = ".col-md-8 > .form-control"
const kycJurisdiction = ":nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container"
const kycJurisdictionState = ":nth-child(7) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container"
const kycRegisteredAddress = ":nth-child(8) > .mt-2 > .col-md-8 > :nth-child(1) > #formFilterValue"
const kycName0fBusinesss = ":nth-child(9) > .mt-2 > .col-md-8 > :nth-child(1) > #formFilterValue"
//Participant Information
//const=""
const kycParticipantInformationPageDesc = ":nth-child(3) > .iyUUIX"

const kycParticipantInformationFname = ":nth-child(3) > :nth-child(2) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycParticipantInformationLname = ":nth-child(3) > :nth-child(3) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycParticipantInformationOccupation = ":nth-child(3) > :nth-child(4) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycParticipantInformationIssuingCountry = ":nth-child(3) > :nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container"
const kycParticipantInformationIDDocument = ":nth-child(3) > :nth-child(7) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const kycParticipantInformationidExpiratiion = ".col-md-8 > .form-control"
const kycParticipantInformationIdentification = ":nth-child(9) > .mt-2 > .col-md-8 > div > #formFilterValue"
const kycParticipantInformationidDocumentImage = ".sc-EhTUr"
const kycParticipantInformationidDocumentImageupload = ":nth-child(10) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-dbXCOC"

//Corporate Documnet
const kyccertifiedCopies = ".sc-gVtoEh"
const kyccEntityName = "#formFilterValue"

//Corporate Document Upload
const kycCertificate = ":nth-child(5) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
//":nth-child(5) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-dbXCOC"
const kycCurrentDirectors = ":nth-child(6) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
//":nth-child(6) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-dbXCOC"
const kycAuthorizedSignatories = ":nth-child(7) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
//":nth-child(7) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-dbXCOC"
const kycShareholders = ":nth-child(8) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
//":nth-child(8) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-dbXCOC"
const kycMemorandum = ":nth-child(9) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
//":nth-child(9) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-dbXCOC"
const kycPowersofAttorney = ":nth-child(10) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-iuImSO"
//":nth-child(10) > .mt-2 > .col-md-8 > .MuiDropzoneArea-root > .MuiDropzoneArea-textContainer > .sc-dbXCOC"

//Corporate Document Delete
const kycCertificateDelete = ":nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > [color=#F42222]"
//":nth-child(5) > .mt-2 > .col-md-8 > .sc-iuImSO > [color=#F42222]"
const kycCurrentDirectorsDelete = ":nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > [color=#F42222]"
//":nth-child(5) > .mt-2 > .col-md-8 > .sc-iuImSO > [color=#F4222]"
const kycAuthorizedSignatoriesDelete = ":nth-child(7) > .mt-2 > .col-md-8 > :nth-child(1) > [color=#F42222]"
//":nth-child(5) > .mt-2 > .col-md-8 > .sc-iuImSO > [color=#F42222]"
const kycShareholdersDelete = ":nth-child(8) > .mt-2 > .col-md-8 > :nth-child(1) > [color=#F42222]"
//":nth-child(5) > .mt-2 > .col-md-8 > .sc-iuImSO > [color=#F42222]"
const kycMemorandumDelete = ":nth-child(9) > .mt-2 > .col-md-8 > :nth-child(1) > [color=#F42222]"
//":nth-child(5) > .mt-2 > .col-md-8 > .sc-iuImSO > [color=#F42222]"
const kycPowersofAttorneyDelete = ":nth-child(10) > .mt-2 > .col-md-8 > :nth-child(1) > [color=#F42222]"
//":nth-child(5) > .mt-2 > .col-md-8 > .sc-iuImSO > [color=#F42222]"
const kycCoporateDocumentChosefile = ".sc-ehALMs"
//Financial Approval
const kycRiskValueRating = ".select__value-container"
const nextButton = ".sc-gGuRsA"

const purposeofSubscriptionOther = ":nth-child(3) > .row > .fZuOCD > .sc-igOmtu > .sc-Jgsit"
const fillInPurposeInput = 'textarea[name="purpose_of_the_subscription_other"]'
const nextButtonDisabled = 'button[type="button"][class="sc-cjzNjn cIJaKN btn btn-primary"]'



const kycAmlElements = {
    kycDateofBirth,
    kycEmail,
    uploadDocumentIDCE2ndClick,
    kycPhoneNumber,
    kycCurrentEmployee,
    kycUSperson,
    kycNetWorth,
    kycCountryofCitizenship,
    kycOfficeLocation,
    headerTitleText,
    kycPoliticallyExposed,
    kycSourceofFunds,
    kycEconomicBeneficiary,
    kycpurposeofSubscription,
    kycDOBFieldsLabel,
    kycEmailLabel,
    kycCountryofCitizenshipIn,
    kycPhoneNumberLabel,
    kycCurrentEmployeeLabel,
    kycUSPersonInvestingLabel,
    kycNetWorthLabel,
    kycCountryofCitizenShipLabel,
    kycOfficeLocationLabel,
    kycPloticallyExposedPersonLabel,
    kycSourceofFundsLabel,
    kycParticipantInformationidDocumentImageupload,
    kycEconomicsBeneficiaryLabel,
    kycPurposeofSubscriptionLabel,
    clickOnNextButton,
    kycHeaderPersonalInformationLabel,
    kycHomeAddressLabel,
    kycHomeAdrressCountry,
    kycHomeAddressAddress,
    kycHomeAddressCity,
    kycHomeAddressState,
    kycHomeAddressZip,
    kycHomeAdrressCountryLabel,
    kycHomeAddressAddressLabel,
    kycHomeAddressCityLabel,
    kycHomeAddressStateLabel,
    kycHomeAddressZipLabel,
    nextButtonHomeAddress,
    uploadDocumentID,
    chooseFile,
    kycParticipantInformationidDocumentImage,
    issuingCountry,
    IDdocumentType,
    IDexpiration,
    IdentificationNumber,
    proofofAddress,
    filenameSpan,
    deleteFileIcon,
    issuingCountrySelect,
    backButtonUploadFile,
    kycCuurentEmployeeRadio,
    kycUSpersonRadio,
    kycWhollyOwnedRadio,
    kyccEntityName,
    kycDirectParentRadio,
    kycSpecificPurposeRadio,
    clickOnNextButtonCE,
    kyccertifiedCopies,
    kycCountryofCitizenshipSelect,
    kycPoliticallyExposedRadio,
    kycSourceofFundRadio,
    kycEconomicBeneficiaryRadio,
    kycpurposeofSubscriptionRadio,
    kycHomeAdrressCountrySelect,
    kycHomeAddressStateSelect,
    IDdocumentTypeSelect,
    uploadDocumentIDCE,
    uploadDocumentIDCE2nd,
    kycYourEntity,
    kycTitleofSigning,
    kycDateOfFormation,
    kycJurisdiction,
    kycRegisteredAddress,
    kycName0fBusinesss,
    kycJurisdictionState,
    kycParticipantInformationPageDesc,
    kycParticipantInformationFname,
    kycParticipantInformationLname,
    kycParticipantInformationOccupation,
    kycParticipantInformationIssuingCountry,
    kycParticipantInformationIDDocument,
    kycParticipantInformationidExpiratiion,
    kycParticipantInformationIdentification,
    kycCertificate,
    kycCurrentDirectors,
    kycAuthorizedSignatories,
    kycShareholders,
    kycMemorandum,
    kycPowersofAttorney,
    kycCertificateDelete,
    kycCurrentDirectorsDelete,
    kycAuthorizedSignatoriesDelete,
    kycShareholdersDelete,
    kycMemorandumDelete,
    kycPowersofAttorneyDelete,
    kycRiskValueRating,
    nextButton,
    kycEconomicBeneficiaryRadioIn,
    purposeofSubscriptionOther,
    fillInPurposeInput,
    kycRegion,
    kycPostalCode,
    kycOfficeLocationcop,
    kycPoliticallyExposedRadiocop,
    kycSourceofFundRadiocop,
    kycEconomicBeneficiarycop,
    kycCuurentEmployeeRadioIN,
    kycUSpersonRadioIN,
    kycEconomicBeneficiaryIN,
    kycCoporateDocumentChosefile


}

module.exports = kycAmlElements