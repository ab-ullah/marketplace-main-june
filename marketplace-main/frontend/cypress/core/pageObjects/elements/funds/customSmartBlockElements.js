const smartViewToggle = '#smart-flow-toggle'
const createCusotmSmartBlock = ".text-end > .btn"
const blockTitle = 'input[name="title"]'
const blobkDescription = 'textarea[name="description"]'
const blockAddFieldButton = '.modal-body > .sc-hGwcmR > fieldset > .mt-4 > .btn'
//'.modal-body > .sc-ehALMs > fieldset > .mt-4 > .btn'
const optionTitle = '.card-body > :nth-child(2) > :nth-child(2) > div > #formFilterValue'
const reviewRequired = '.sc-fXazdy > .select__control > .select__value-container'
const secondOptionTitle = ':nth-child(6) > .card-body > :nth-child(2) > :nth-child(2) > div > #formFilterValue'
const secondReviewRequired = ':nth-child(6) > .card-body > :nth-child(5) > :nth-child(2) > :nth-child(1) > .sc-fXazdy > .select__control > .select__value-container'
const closeButton = ".sc-fxFQKN"
//'.btn-close'
const logicalForm = "#uncontrolled-tab-example-tab-logicalForm"
//Logical Form Elements
const USHolderBlock = '//div[contains(text(),"U.S. Holder")]'
const USAUSAccBlock = '//div[contains(text(),"US Accredited Investor Rules")]'
const USAUSKnwEmpBlock = '//div[contains(text(),"Knowledgeable Employee")]'
const USAccBlock = 'aside > :nth-child(10)'
//'aside > :nth-child(9)'
const reactCanvas = '.react-flow__pane'
const canvasUSHolderBlock = 'div [class="react-flow__node react-flow__node-default nopan light selectable parent"]'
const canvasUSAccBlock = 'div [data-id="US-AI"]'


const linkUSHolder = '.selected > .react-flow__handle-bottom'
const linkUSAcc = '.parent > .react-flow__handle-top'
const USUSAccParentTopLink = 'div [data-nodeid="US-AI"][data-handlepos="top"]'
const fitViewPane = '.react-flow__controls-fitview'

const QuaPurBlock = 'aside > :nth-child(13)'
const USQuaPurBlock = 'aside > :nth-child(15)'
const USQuaPurBlockUS = 'aside > :nth-child(14)'
const USKnwEmpBlock = 'aside > :nth-child(5)'
const USFinalBlock = 'aside > :nth-child(13)'

const bottomlinkUSAcc = '[data-id="US-AI"] > .react-flow__handle-bottom'
const topLinkQP = '[data-id="US-QP"] > .react-flow__handle-top'

const canvasQPBlock = 'div [data-id="US-QP"]'
const canvasKnowEmpBlock = 'div [data-id="KE"]'

const bottomKnowEmp = '[data-id="KE"] > .react-flow__handle-bottom'
const topFinalBlock = '.react-flow__node-output > .react-flow__handle'
const previewButton = 'a button[class="btn btn-outline-primary"]'
const countrySelection = '#accredited-0'
const notUSAeligible = '#accredited-1'
const QPSelection = '#US-QP-Options-0'
//Aus
const selectedTopNode = '.selected > .react-flow__handle-top'
const USHolderYesBottomNode = "//body/div[@id='root']/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]"

const USAccBlockBottomNode = '[data-id="US-AI"] > .react-flow__handle-bottom'
const KnwEmpBlockBottomNode = '[data-id="KE"] > .react-flow__handle-bottom'

const ausWholeSaleBlock = '//div[contains(text(),"AU Wholesale Client Rules")]'
const ausWholeSaleBlockCanvas = 'div [data-id="AU-WC"]'

const USHolderNoBottomNode = "//body/div[@id='root']/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[2]"

const ausSophInvR = '//div[contains(text(),"AU Sophisticated Investor Rules")]'
const ausSophInvRCanvas = 'div [data-id="AU-SI"]'

const ausWholeSaleBottomNode = '[data-id="AU-WC"] > .react-flow__handle-bottom'
const ausSophInvRTopNode = '[data-id="AU-SI"] > .react-flow__handle-top'

const ausProfInvR = '//div[contains(text(),"AU Professional Investor Rules")]'
const ausProfInvRule = '//div[contains(text(),"AU Professional Investor Rules")]'
const ausProfInvRCanvas = 'div [data-id="AU-PI"]'

const ausSophInveRBottomNode = '[data-id="AU-SI"] > .react-flow__handle-bottom'
const ausProfInvRTopNode = '[data-id="AU-PI"] > .react-flow__handle-top'

const finalBlock = 'aside > :nth-child(10)'
const ausProfInvRBottomNode = '[data-id="AU-PI"] > .react-flow__handle-bottom'
const finalBlockTopNode = '.react-flow__node-output > .react-flow__handle'

//Preview
const wholesaleclientoption = '#AU-WC-Options-0'
const sophisticatedInvestor = '#AU-SI-Options-0'
const professionalInvestor = '#AU-PI-Options-0'
const backToEditButton = 'a > .btn'

const CNlegitimate = '//div[contains(text(),"CN Legitimate Oversea Assets")]'
const CNlegitimateCanvas = 'div [data-id="CN-LOA"]'
const CNqpBottomNode = '[data-id="US-QP"] > .react-flow__handle-bottom'
const CNlegitimateTopNode = '[data-id="CN-LOA"] > .react-flow__handle-top'
const CNlegitimateBottomNode = '[data-id="CN-LOA"] > .react-flow__handle-bottom'
const CNFinalBlock = 'aside > :nth-child(12)'
const legitimateOption = '#CN-LOA-Options-0'

const TitleJPind = '.modal-body > .sc-hGwcmR > fieldset > :nth-child(1) > :nth-child(2) > div > #formFilterValue'
const DescriptionJPind = '.modal-body > .sc-hGwcmR > fieldset > :nth-child(2) > :nth-child(2) > div > #formFilterValue'
const optionTitleJPind = '.modal-body > .sc-hGwcmR > fieldset > .mb-2 > .card-body > :nth-child(2) > :nth-child(2) > div > #formFilterValue'
const reviewRequiredJP = '.modal-body > .sc-hGwcmR > fieldset > .mb-2 > .card-body > :nth-child(5) > :nth-child(2) > :nth-child(1) > .sc-fXazdy > .select__control > .select__value-container'
const reviewRequiredSecondJP = '.modal-body > .sc-hGwcmR > fieldset > :nth-child(6) > .card-body > :nth-child(5) > :nth-child(2) > :nth-child(1) > .sc-fXazdy > .select__control'
const optionTitleSecondJPind = '.modal-body > .sc-hGwcmR > fieldset > :nth-child(6) > .card-body > :nth-child(2) > :nth-child(2) > div > #formFilterValue'
const createCusotmSmartBlockJP = '.modal-body > .text-end > .btn'
const addFieldJP = '.modal-body > .sc-hGwcmR > fieldset > .mt-4 > .btn'

const jpUSHolder = 'aside > :nth-child(18)'
const jpUSAcc = '//div[contains(text(),"US Accredited Investor Rules")]'
const jpKnowEmp = '//div[contains(text(),"Knowledgeable Employee")]'
const jpQuaPur = '//div[contains(text(),"Qualified Purchaser")]'
const jpEligibleRule = '//div[contains(text(),"JP Eligible Rules")]'
const jpEligibleRuleCanvas = 'div [data-id="JP-EE"]'
const jpEligibleRuleTopNode = '[data-id="JP-EE"] > .react-flow__handle-top'
const jpEligibleRuleBottomNode = '[data-id="JP-EE"] > .react-flow__handle-bottom'
const jpFinalBlock = 'aside > :nth-child(12)'
const jpJPIndInvs = '//div[contains(text(),"JP Individual Professional Investor")]'
const jpJPIndInvsCanvas = '//body/div[@id="root"]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[33]'
const jpjpJPIndInvsTopNode = '.selected > .react-flow__handle-top'
const jpDisqualifyingInvs = '//div[contains(text(),"Disqualifying Investor")]'
const jpDisqualifyingInvsCanvas = '//body/div[@id="root"]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[36]'
//'//body/div[@id="root"]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[36]'
//body/div[@id='root']/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[36]
const jpjpJPIndInvsBottomNode = '//body/div[@id="root"]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[33]/div[2]'
const jpDisqualifyingInvsTopNode = '.selected > .react-flow__handle-top'
const jpDisqualifyingInvsBottomNode = '//body/div[@id="root"]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[36]/div[2]'
const jpUSHolderNoOptionBottomNode = '//body/div[@id="root"]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[2]'
const jpEligibilityRuleTopNode = '//body/div[@id="root"]/div[2]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[28]/div[1]'
const jpInvestingOption = '#JP-EE-Options-0'
const jpDisqualifyingOption = '#accredited-0'


const cutomSmartBlockElements = {
    smartViewToggle,
    createCusotmSmartBlock,
    blockTitle,
    blobkDescription,
    blockAddFieldButton,
    optionTitle,
    reviewRequired,
    secondOptionTitle,
    secondReviewRequired,
    closeButton,
    logicalForm,
    USHolderBlock,
    USAccBlock,
    reactCanvas,
    linkUSHolder,
    linkUSAcc,
    canvasUSHolderBlock,
    canvasUSAccBlock,
    fitViewPane,
    QuaPurBlock,
    USKnwEmpBlock,
    USFinalBlock,
    bottomlinkUSAcc,
    topLinkQP,
    canvasQPBlock,
    canvasKnowEmpBlock,
    bottomKnowEmp,
    topFinalBlock,
    previewButton,
    countrySelection,
    QPSelection,
    selectedTopNode,
    USHolderYesBottomNode,
    USAccBlockBottomNode,
    KnwEmpBlockBottomNode,
    ausWholeSaleBlock,
    ausWholeSaleBlockCanvas,
    USHolderNoBottomNode,
    ausSophInvR,
    ausSophInvRCanvas,
    ausWholeSaleBottomNode,
    ausSophInvRTopNode,
    ausProfInvR,
    ausProfInvRCanvas,
    ausSophInveRBottomNode,
    ausProfInvRTopNode,
    finalBlock,
    ausProfInvRBottomNode,
    finalBlockTopNode,
    wholesaleclientoption,
    sophisticatedInvestor,
    professionalInvestor,
    notUSAeligible,
    backToEditButton,
    USUSAccParentTopLink,
    USQuaPurBlock,
    USQuaPurBlockUS,
    CNlegitimate,
    CNlegitimateCanvas,
    CNqpBottomNode,
    CNlegitimateTopNode,
    CNlegitimateBottomNode,
    CNFinalBlock,
    legitimateOption,
    TitleJPind,
    DescriptionJPind,
    optionTitleJPind,
    reviewRequiredJP,
    reviewRequiredSecondJP,
    optionTitleSecondJPind,
    createCusotmSmartBlockJP,
    addFieldJP,
    jpUSHolder,
    jpUSAcc,
    jpKnowEmp,
    jpQuaPur,
    jpEligibleRule,
    jpEligibleRuleCanvas,
    jpEligibleRuleBottomNode,
    jpEligibleRuleTopNode,
    jpFinalBlock,
    jpJPIndInvs,
    jpJPIndInvsCanvas,
    jpjpJPIndInvsTopNode,
    jpDisqualifyingInvs,
    jpDisqualifyingInvsCanvas,
    jpjpJPIndInvsBottomNode,
    jpDisqualifyingInvsTopNode,
    jpDisqualifyingInvsBottomNode,
    jpUSHolderNoOptionBottomNode,
    jpEligibilityRuleTopNode,
    jpInvestingOption,
    jpDisqualifyingOption,
    USAUSAccBlock,
    USAUSKnwEmpBlock,
    ausProfInvRule





}

module.exports = cutomSmartBlockElements