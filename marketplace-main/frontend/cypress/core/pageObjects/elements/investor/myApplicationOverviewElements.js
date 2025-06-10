//Header
const titleHeader = "div h1"
//".sc-kBqmDu"
//old '.sc-irqbAE'
const submitChangeButton = ".me-2"
const withDrawApplicationButton = ".sc-iiBnNu"
//    ".sc-hmvkKb"
//old ".sc-eKaNGd"
const backtoDashboardButton = 'div img[src="/static/media/arrow-left-icon.ae2f0f3d.svg"]'
const companyLogo = "img.company-logo"
//".sc-kkmGkm"
// old .sc-hHSjgo
const fundTitle = "div.suffix-text"
//".sc-jogDgT"
const infotab = "div.iOhRso"
const continueYourApplication = ".action"
//const tesxt ="element"
//Investor Information
const investingDropdown = 'fieldset > :nth-child(1) > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//"form > :nth-child(1) > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const wheretoInvest = ":nth-child(2) > .col-md-8 > :nth-child(1)"
const firstNameOverview = "input[name=firstName]"
const lastNameOverview = "input[name=lastName]"
const jobtitleOverview = "input[name=jobTitle]"
const department = ":nth-child(6) > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const jobBand = ":nth-child(7) > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value"
const restrictedGeographicArea = '#restricted_geographic_area'
const restrictedTimePeriod = '#restricted_time_period'
const investmentHeading = '[name="investment_amount"] > .sc-ekA-drt'
//'[name="investment_amount"] > .sc-jhDJEt'
//'[name=investment_amount] > .sc-bKoJNE'
//old '[name=investment_amount] > .sc-cfARRi'
const finalizeEquity = '.sc-eSoXWK > .sc-hkoqWr > :nth-child(1) > .currency-field > input'
//".sc-eSoXWK > .sc-hkoqWr> :nth-child(1) > .currency-field > input"

//".sc-bRubDb > .sc-bUQyIj > :nth-child(1) > .currency-field > input"
//old '.sc-kqfmhM > .sc-bUQyIj > :nth-child(1) > .currency-field > input'
const howmuchLeverage1st = '.sc-hRUHzT > .sc-hkoqWr > :nth-child(2) > .mb-1 > :nth-child(1)'
//".sc-zHacW > .sc-dksuTV > :nth-child(2) > .mb-1 > :nth-child(1)"
//old '.sc-kqfmhM > .sc-bUQyIj > :nth-child(2) > .mb-1 > :nth-child(1)'
const howmuchLeverage2nd = ".sc-hRUHzT > .sc-hkoqWr > :nth-child(2) > .mb-1 > :nth-child(2)"
//old '.sc-kqfmhM > .sc-bUQyIj > :nth-child(2) > .mb-1 > :nth-child(2)'
const howmuchLeverage3rd = ".sc-hRUHzT > .sc-hkoqWr > :nth-child(2) > .mb-1 > .selectedRadio"
//old ".sc-kqfmhM > .sc-bUQyIj > :nth-child(2) > .mb-1 > .selectedRadio"
const grossInvestmentEquity = '.sc-hRUHzT > .sc-hkoqWr > :nth-child(3) > .sc-czNxle > span'
//".sc-hRUHzT > .sc-hkoqWr > :nth-child(3) > .sc-hkoqWr > .bIFwIr > .value > span"
//old '.sc-kqfmhM > .sc-bUQyIj > :nth-child(3) > .sc-dSnXvR > .beqjIe > .value > span'
const grossInvestmentLeverage = '.sc-hRUHzT > .sc-hkoqWr > :nth-child(3) > .sc-juXuNZ > .cTLudL > .value > span'
//".sc-hRUHzT > .sc-hkoqWr > :nth-child(3) > .sc-hkoqWr > .fyrnOP > .value > span"
//old '.sc-kqfmhM > .sc-bUQyIj > :nth-child(3) > .sc-dSnXvR > .gJINOS > .value > span'
const finalizedGrossInvestment = '.sc-eSoXWK > .sc-hkoqWr > :nth-child(3) > .sc-czNxle > span'
//".sc-eSoXWK > .sc-hkoqWr > :nth-child(2) > .form-label > span"
//old '.sc-kqfmhM > .sc-bUQyIj > :nth-child(3) > .form-label'
const finalizedGrossLeverage = '.sc-eSoXWK > .sc-hkoqWr > :nth-child(3) > .sc-juXuNZ > .cTLudL > .value > span'
//".sc-eSoXWK > .sc-hkoqWr> :nth-child(3) > .sc-hkoqWr > .bIFwIr > .value > span"
//old '.sc-ezHeEz > .sc-bUQyIj > :nth-child(3) > .form-label'
const finalizedLeverage1st = ".sc-eSoXWK > .sc-hkoqWr > :nth-child(2) > .mb-1 > :nth-child(1)"
//old '.sc-ezHeEz > .sc-bUQyIj > :nth-child(2) > .mb-1 > :nth-child(1)'
const finalizedLeverage2nd = ".sc-eSoXWK > .sc-hkoqWr > :nth-child(2) > .mb-1 > :nth-child(2)"
//old '.sc-ezHeEz > .sc-bUQyIj > :nth-child(2) > .mb-1 > :nth-child(2)'
const finalizedLeverage3rd = ".sc-eSoXWK > .sc-hkoqWr > :nth-child(2) > .mb-1 > :nth-child(3)"
//old '.sc-ezHeEz > .sc-bUQyIj > :nth-child(2) > .mb-1 > :nth-child(3)'
const finalizedLeverage4th = ".sc-eSoXWK > .sc-hkoqWr > :nth-child(2) > .mb-1 > .selectedRadio"
//old '.sc-ezHeEz > .sc-bUQyIj > :nth-child(2) > .mb-1 > .selectedRadio'
const eligibilityCriteriaHeading = '[name="eligibility_criteria"] > .sc-ekA-drt'
//'[name="eligibility_criteria"] > .sc-bKoJNE'
//old '[name="eligibility_criteria"] > .sc-cfARRi'
const accreditedInvestorLabel = ':nth-child(5) > :nth-child(2) > .row > .field-label'
const eligibilityDescription = "#eligibility_criteria > :nth-child(2) > :nth-child(2)"
//old '.sc-hLyimJ > :nth-child(5) > :nth-child(2) > :nth-child(2)'
const uploadCreditReportText = ':nth-child(3) > .mb-3 > :nth-child(1)'
const uploadFile = ".sc-aiooD"
//old    '.sc-fvNhHS'
const fileSpan = ".sc-iQQLPo > span"
//    ".sc-jNjAJB > span"
//old '.sc-ihRHuF'
const knowledgeableQuestion = ':nth-child(5) > :nth-child(3) > .row > .field-label'
const knowledgeableDescription = '#eligibility_criteria > :nth-child(3) > .mb-3'
//':nth-child(5) > :nth-child(3) > .mb-3'
const personalInformationHeading = '[name="personal_information"] > .sc-iiBnNu'
//'[name="personal_information"] > .sc-gJjCVn'
//old '[name="personal_information"] > .sc-ezjrSx'
const kycHyperlink = ":nth-child(2) > .sc-hWZktu"
//":nth-child(2) > .sc-ekA-drt"
//old    '.sc-jhDJEt'
const DOB = 'input[value="1990-12-21"]'
const emailAddress = "input[name=email][placeholder]"
const currentEmployee = ':nth-child(6) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
const USperson = ':nth-child(7) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
const whollyOwned = ':nth-child(8) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
const directParent = ':nth-child(9) > .mt-2 > .col-md-8 > .row > .fZuOCD> label'
const specificPurpose = ':nth-child(10) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
const netWorth = 'input[name="net_worth"]'
const politicalExposed = ':nth-child(14) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
//':nth-child(6) > .mt-2 > .col-md-8 > .row > .gMzSTu > label'
const politicalExposedIn = ':nth-child(11) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
const sourcesofFund = ':nth-child(15) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'

const sourcesofFundIN = ':nth-child(12) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
const economicBeneficiary = ':nth-child(16) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'

const economicBeneficiaryIN = ':nth-child(13) > .mt-2 > .col-md-8 > .row > .fZuOCD > label'
const purposeofsubscription = ':nth-child(3) > .row > .fZuOCD'

const homeAddressHeading = 'div[name="home_address"] > .sc-iiBnNu'
//'div[name="home_address"] > .sc-gJjCVn'
//old 'div[name="home_address"] > .sc-ezjrSx'

const homeAddressCountry = '#home_address > :nth-child(2) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//':nth-child(7) > :nth-child(2) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const homeAddress = ".col-md-8 div input[placeholder=Address]"
const homeAddressCity = ".col-md-8 div input[placeholder=City]"
const homeAddressState = '#home_address > :nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//':nth-child(7) > :nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const homeAddressZip = ".col-md-8 div input[placeholder=Zip]"

const uploadDocumentsHeading = '[name="upload_documents"] > .sc-iiBnNu'
//'[name="upload_documents"] > .sc-gJjCVn'
const issuingCountry = '#upload_documents > :nth-child(2) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//':nth-child(8) > :nth-child(2) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const IDdocumentType = ':nth-child(3) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const IDexpiration = '#upload_documents > :nth-child(4) > .mt-2 > .col-md-8 > .form-control'
//':nth-child(8) > :nth-child(4) > .mt-2 > .col-md-8 > .form-control'
const identificationNumber = '#upload_documents > :nth-child(5) > .mt-2 > .col-md-8 > div > #formFilterValue'
//':nth-child(8) > :nth-child(5) > .mt-2 > .col-md-8 > div > #formFilterValue'

const IDdocumentfile = '#upload_documents > :nth-child(6) > .mt-2 > .col-md-8 > .sc-hJFzke > .sc-lfRxJW'
//":nth-child(6) > .mt-2 > .col-md-8 > .sc-dwxYdI > .sc-hfVBHA"
//":nth-child(8) > :nth-child(6) > .mt-2 > .col-md-8 > .sc-EhTUr > .sc-biHcxt"
//old ':nth-child(8) > :nth-child(6) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const IDdocumentUploadButton = '#upload_documents > :nth-child(6) > .mt-2 > .col-md-8 > .sc-liAPKD'
//    ":nth-child(6) > .mt-2 > .col-md-8 > .sc-gVtoEh"
//':nth-child(8) > :nth-child(6) > .mt-2 > .col-md-8 > .sc-dwxYdI'
const deleteIcon = '#upload_documents > :nth-child(6) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"]'
//':nth-child(6) > .mt-2 > .col-md-8 > .sc-dwxYdI > [color="#F42222"]'
const proofofAddressDescription = ':nth-child(7) > .mt-2 > .field-help-text > span'
const proofofAddressfile = ':nth-child(7) > .mt-2 > :nth-child(3) > .sc-hJFzke > .sc-lfRxJW'
//":nth-child(3) > .sc-dwxYdI > .sc-hfVBHA"
//":nth-child(3) > .sc-EhTUr > .sc-biHcxt"
//old ':nth-child(3) > .sc-iuImSO > .sc-fTFMiz'
const proofofAddressUploadButton = ':nth-child(7) > .mt-2 > :nth-child(3) > .sc-liAPKD'
const deleteIcon2nd = ':nth-child(7) > .mt-2 > :nth-child(3) > .sc-hJFzke > [color="#F42222"]'


const corporateEntityHeading = '[name="corporate_entity"] > .sc-iiBnNu'
//    '[name="corporate_entity"] > .sc-gJjCVn'
//old '[name="corporate_entity"] > .sc-ezjrSx'
const nameofEntity = '#corporate_entity > :nth-child(2) > .mt-2 > .col-md-8 > div > #formFilterValue'
//':nth-child(9) > :nth-child(2) > .mt-2 > .col-md-8 > div > #formFilterValue'
const titleSigning = '#corporate_entity > :nth-child(3) > .mt-2 > .col-md-8 > div > #formFilterValue'
//':nth-child(9) > :nth-child(3) > .mt-2 > .col-md-8 > div > #formFilterValue'
const dateofFormation = '#corporate_entity > :nth-child(4) > .mt-2 > .col-md-8 > .form-control'
//':nth-child(9) > :nth-child(4) > .mt-2 > .col-md-8 > .form-control'
const Jurisdiction = '#corporate_entity > :nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//':nth-child(9) > :nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const state = ':nth-child(6) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const registedredAddress = 'input[name="registered_address"]'
const natureofBusiness = ':nth-child(8) > .mt-2 > .col-md-8 > div > #formFilterValue'

const corporateDocuments = '[name="corporate_documents"] > .sc-iiBnNu'
//'[name="corporate_documents"] > .sc-gJjCVn'
//old '[name="corporate_documents"] > .sc-ezjrSx'
const entityName = '#corporate_documents > :nth-child(2) > .mt-2 > .col-md-8 > div > #formFilterValue'

const certificateLabel = '#corporate_documents > :nth-child(3) > .mt-2 > .field-label'
//':nth-child(10) > :nth-child(3) > .mt-2 > .field-label'
const certificateUploadButton = ":nth-child(3) > .mt-2 > .col-md-8 > .sc-liAPKD"
//old ':nth-child(3) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const certificateDeleteIcon = ':nth-child(3) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"] > path'

const currentDirectorLabel = '#corporate_documents > :nth-child(4) > .mt-2 > .field-label'
//':nth-child(10) > :nth-child(4) > .mt-2 > .field-label'
const currentDirectorUploadButton = ":nth-child(4) > .mt-2 > .col-md-8 > .sc-liAPKD"
//old    ':nth-child(4) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const currentDirectorDeleteIcon = ':nth-child(4) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"] > path'

const signatoriesLabel = '#corporate_documents > :nth-child(5) > .mt-2 > .field-label'
//':nth-child(10) > :nth-child(5) > .mt-2 > .field-label'
const signatoriesUploadButton = ":nth-child(5) > .mt-2 > .col-md-8 > .sc-liAPKD"
//old  ':nth-child(5) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const signatoriesDeleteIcon = ':nth-child(5) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"] > path'

const shareholderLabel = '#corporate_documents > :nth-child(6) > .mt-2 > .field-label'
//'#corporate_documents > :nth-child(10) > :nth-child(6) > .mt-2 > .field-label'
const shareholderUploadButton = "#corporate_documents > :nth-child(6) > .mt-2 > .col-md-8 > .sc-liAPKD"
//old ':nth-child(10) > :nth-child(6) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const shareholderDeleteIcon = '#corporate_documents > :nth-child(6) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"] > path'

const memorandumLabel = '#corporate_documents > :nth-child(7) > .mt-2 > .field-label'
const memorandumUploadButton = "#corporate_documents > :nth-child(7) > .mt-2 > .col-md-8 > .sc-liAPKD"
//old ':nth-child(10) > :nth-child(7) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const memorandumDeleteIcon = '#corporate_documents > :nth-child(7) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"] > path'

const resolutionLabel = '#corporate_documents > :nth-child(8) > .mt-2 > .field-label'
const resolutionUploadButton = "#corporate_documents > :nth-child(8) > .mt-2 > .col-md-8 > .sc-liAPKD"
//old ':nth-child(10) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const resolutionDeleteIcon = '#corporate_documents > :nth-child(8) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"] > path'

const accordHeader = 'button[class="accordion-button"]'
const firstName = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(1) > .mt-2 > .col-md-8 > div > #formFilterValue'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(1) > .mt-2 > .col-md-8 > div > #formFilterValue'
const lastName = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(2) > .mt-2 > .col-md-8 > div > #formFilterValue'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(2) > .mt-2 > .col-md-8 > div > #formFilterValue'
const occupation = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(3) > .mt-2 > .col-md-8 > div > #formFilterValue'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(3) > .mt-2 > .col-md-8 > div > #formFilterValue'
const issuingCountryParticipantInfo = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(4) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(4) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const IDdocumenttype = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(5) > .mt-2 > .col-md-8 > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__single-value'
const participantIDexpiration = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(6) > .mt-2 > .col-md-8 > .form-control'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(6) > .mt-2 > .col-md-8 > .form-control'
const identificationNumner = ':nth-child(12) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(7) > .mt-2 > .col-md-8 > div > #formFilterValue'
//    ':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(7) > .mt-2 > .col-md-8 > div > #formFilterValue'
const onlyOneDirectorCheckBox = '.selectedRadio > #t'
const participantFile = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-hJFzke > .sc-lfRxJW'
//":nth-child(14) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-dwxYdI > .sc-hfVBHA"
//old ':nth-child(14) > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-iuImSO > .sc-fTFMiz'
const partcipantUploadButton = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-liAPKD'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-gVtoEh'
const participantDeleteIcon = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-hJFzke > [color="#F42222"]'
//':nth-child(12) > .sc-ekA-drt > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(8) > .mt-2 > .col-md-8 > .sc-dwxYdI > [color="#F42222"] > path'
const sourceOfWealth = ':nth-child(10) > .sc-kOokqr > .accordion-item > .accordion-collapse > .accordion-body > :nth-child(1) > :nth-child(10) > .mt-2 > :nth-child(3) > div > #formFilterValue'
//'textarea[name="source_of_wealth"]'


const taxDetailsHeading = '.p-0.pt-2 > section > :nth-child(1)'
const country = '.css-12jo7m5'
const USholder = ':nth-child(3) > .mb-1 > .selectedRadio > .form-check-label'
const taxExempt = ':nth-child(4) > .mb-1 > .selectedRadio > .form-check-label'
const partnership = ':nth-child(5) > .mb-1 > .selectedRadio > .form-check-label'
const exemptofTaxation = ':nth-child(6) > .mb-1 > .selectedRadio > .form-check-label'
const taxPayerIdentificationNumber = '#tin_or_ssn'

const taxFormHeading = '.p-0.pt-2 > section > :nth-child(10)'
const firstFormName = '.field-label-auto'
const firstFormFile = ".sc-btlduw > .sc-hJFzke > .sc-lfRxJW"
//old     ':nth-child(11) > .sc-jCPRHX > .sc-iuImSO > .sc-kSCemg'
const firstFormDelete = '.sc-btlduw > .sc-hJFzke > [color="#F42222"]'
//'.sc-bwcZwS > .sc-dwxYdI > [color="#F42222"]'

//old ':nth-child(11) > .sc-jCPRHX > .sc-iuImSO > .MuiSvgIcon-root > path'
const firstFormStatus = '.sc-cQDFzS'
//".sc-ojivU"
//old ':nth-child(11) > .sc-gBsxbr'
const secondFormName = ':nth-child(12) > .field-label-auto'
const secondFormFile = ":nth-child(12) > .sc-jhDJEt > .sc-iuImSO > .sc-cfARRi"
const secondFormDelete = ":nth-child(12) > .sc-jhDJEt > .sc-iuImSO > .MuiSvgIcon-root"
const secondFormStatus = ":nth-child(12) > .sc-gggoXN"
const thirdFormName = ':nth-child(13) > .field-label-auto'
const thirdFormFile = ":nth-child(13) > .sc-jhDJEt > .sc-iuImSO > .sc-cfARRi"
const thirdFormDelete = ":nth-child(13) > .sc-jhDJEt > .sc-iuImSO > .MuiSvgIcon-root"
const thirdFormStatus = ":nth-child(13) > .sc-gggoXN"
const gotoTaxFormLink = 'section > :nth-child(14) > a'


const bankingDetailsHeading = '[name="banking_details"] > .sc-ekA-drt'
//'[name="banking_details"] > .sc-cfARRi'
const bankLocated = ':nth-child(3) > .basic-single > .select__control > .select__value-container > .select__single-value'
const bankName = "input[name=bank_name]"
const swiftCode = "input[name=swift_code]"
const intermediaryCheckBox = '#approval-true'
const intermediaryBankName = "input[name=intermediary_bank_name]"
const intermediarySwiftCode = "input[name=intermediary_bank_swift_code]"
const streetAddress = "input[name=street_address]"
const city = "input[name=city]"
const province = "input[name=province]"
const postalCode = "input[name=postal_code]"
const accountName = "input[name=account_name]"
const accountNumber = "input[name=account_number]"
const ibanNumber = "input[name=iban_number]"
const creditAccountName = "input[name=credit_account_name]"
const creditAccountNumber = "input[name=credit_account_number]"
const currency = ':nth-child(14) > .basic-single > .select__control > .select__value-container > .select__single-value'
const reference = "input[name=reference]"


const documentHeading = '[name="fund_documents"] > .sc-jhDJEt'
// old '[name="fund_documents"] > .sc-cfARRi'
const gotoDocumentLink = '[name="fund_documents"] > :nth-child(2) > a'
const downloadicon = ".sc-gpEJdM > .sc-hUhoqY > .download-icon"
//old '.sc-hlXxXZ > .sc-kOokqr > .download-icon'
const documentCheckBox = 'input[type="checkbox"]'
const documentFile = '.file-tag > .form-check > .form-check-label'
const documentEyeIcon = ".sc-gpEJdM > .sc-hUhoqY > .file-tag > .MuiSvgIcon-root"
//old    '.sc-hlXxXZ > .sc-kOokqr > .file-tag > .MuiSvgIcon-root'
const modalHeading = '.modal-title'
const modalDownloadButton = ".sc-hoPuav > :nth-child(1)"
//old    '.sc-fJxALz > :nth-child(1)'
const modalCloseButton = ".sc-hoPuav > :nth-child(2)"
//old '.sc-fJxALz > :nth-child(2)'

const programDocumentHeading = '#poa > .sc-ekA-drt'
//old '[name="poa"] > .sc-cfARRi'
const powerofAttorney = '.sc-dwxYdI > :nth-child(1) > .mt-3'
//".sc-iuImSO > :nth-child(1) > .mt-3"
//'.sc-hGwcmR > :nth-child(1) > .mt-3'
const programeDocumentDownloadIcon = '.col-md-12 > .sc-lgWdIC > .download-icon'
//".col-md-12 > .sc-fJxALz > .download-icon"
//old '.col-md-12 > .sc-kOokqr > .download-icon'

const programDocumentFile = '.sc-hHSjgo > .form-label'
//".sc-iKUVsf > .form-label"
//old '.sc-cApVyb > .form-label'

const programeDocumentEyeIcon = '.col-md-12 > .sc-lgWdIC > .file-tag > :nth-child(2) > path'
//".col-md-12 > .sc-fJxALz > .file-tag > :nth-child(2)"
//old '.col-md-12 > .sc-kOokqr > .file-tag > :nth-child(2)'
const programDocumentModalHeading = '.modal-title'
const programDocumentPopUpDownloadButton = '.sc-gswFgi > :nth-child(1)'
//".sc-leehGg > :nth-child(1)"
//old '.sc-fJxALz > :nth-child(1)'
const programDocumentCloseButton = ".sc-gswFgi > :nth-child(2)"
//old '.sc-fJxALz > :nth-child(2)'
const agreement = '.sc-hHSjgo > .form-control'
//".sc-iKUVsf > .form-control"
//old '.sc-cApVyb > .form-control'


const myApplicationOverviewElement = {
    titleHeader,
    submitChangeButton,
    withDrawApplicationButton,
    backtoDashboardButton,
    companyLogo,
    fundTitle,
    infotab,
    continueYourApplication,
    investingDropdown,
    wheretoInvest,
    firstNameOverview,
    lastNameOverview,
    jobtitleOverview,
    department,
    jobBand,
    restrictedGeographicArea,
    restrictedTimePeriod,
    investmentHeading,
    finalizeEquity,
    howmuchLeverage1st,
    howmuchLeverage2nd,
    howmuchLeverage3rd,
    grossInvestmentEquity,
    grossInvestmentLeverage,
    finalizedGrossInvestment,
    finalizedGrossLeverage,
    finalizedLeverage1st,
    finalizedLeverage2nd,
    finalizedLeverage3rd,
    finalizedLeverage4th,
    eligibilityCriteriaHeading,
    accreditedInvestorLabel,
    eligibilityDescription,
    uploadCreditReportText,
    uploadFile,
    fileSpan,
    knowledgeableQuestion,
    knowledgeableDescription,
    personalInformationHeading,
    kycHyperlink,
    DOB,
    emailAddress,
    currentEmployee,
    USperson,
    whollyOwned,
    directParent,
    specificPurpose,
    netWorth,
    politicalExposed,
    sourcesofFund,
    economicBeneficiary,
    purposeofsubscription,
    homeAddressHeading,
    homeAddressCountry,
    homeAddress,
    homeAddressCity,
    homeAddressState,
    homeAddressZip,
    uploadDocumentsHeading,
    issuingCountry,
    IDdocumentType,
    IDexpiration,
    identificationNumber,
    IDdocumentfile,
    IDdocumentUploadButton,
    deleteIcon,
    proofofAddressDescription,
    proofofAddressfile,
    proofofAddressUploadButton,
    deleteIcon2nd,
    corporateEntityHeading,
    nameofEntity,
    titleSigning,
    dateofFormation,
    Jurisdiction,
    state,
    registedredAddress,
    natureofBusiness,
    corporateDocuments,
    entityName,
    certificateLabel,
    certificateUploadButton,
    certificateDeleteIcon,
    currentDirectorLabel,
    currentDirectorUploadButton,
    currentDirectorDeleteIcon,
    signatoriesLabel,
    signatoriesUploadButton,
    signatoriesDeleteIcon,
    shareholderLabel,
    shareholderUploadButton,
    shareholderDeleteIcon,
    memorandumLabel,
    memorandumUploadButton,
    memorandumDeleteIcon,
    resolutionLabel,
    resolutionUploadButton,
    resolutionDeleteIcon,
    accordHeader,
    firstName,
    lastName,
    occupation,
    issuingCountryParticipantInfo,
    IDdocumenttype,
    participantIDexpiration,
    identificationNumner,
    onlyOneDirectorCheckBox,
    participantFile,
    partcipantUploadButton,
    participantDeleteIcon,
    sourceOfWealth,
    taxDetailsHeading,
    country,
    USholder,
    taxExempt,
    partnership,
    exemptofTaxation,
    taxPayerIdentificationNumber,
    taxFormHeading,
    firstFormName,
    firstFormFile,
    firstFormDelete,
    firstFormStatus,
    secondFormName,
    secondFormFile,
    secondFormDelete,
    secondFormStatus,
    thirdFormName,
    thirdFormFile,
    thirdFormDelete,
    thirdFormStatus,
    gotoTaxFormLink,
    bankingDetailsHeading,
    bankLocated,
    bankName,
    swiftCode,
    intermediaryCheckBox,
    intermediaryBankName,
    intermediarySwiftCode,
    streetAddress,
    city,
    province,
    postalCode,
    accountName,
    accountNumber,
    ibanNumber,
    creditAccountName,
    creditAccountNumber,
    currency,
    reference,
    documentHeading,
    gotoDocumentLink,
    downloadicon,
    documentCheckBox,
    documentFile,
    documentEyeIcon,
    modalHeading,
    modalDownloadButton,
    modalCloseButton,
    programDocumentHeading,
    powerofAttorney,
    programeDocumentDownloadIcon,
    programDocumentFile,
    programeDocumentEyeIcon,
    programDocumentModalHeading,
    programDocumentPopUpDownloadButton,
    programDocumentCloseButton,
    agreement,
    politicalExposedIn,
    sourcesofFundIN,
    economicBeneficiaryIN

}

module.exports = myApplicationOverviewElement