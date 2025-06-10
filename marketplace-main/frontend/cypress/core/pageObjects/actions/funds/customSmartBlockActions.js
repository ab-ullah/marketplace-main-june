import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'

const clickOnSmartViewToggle = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.smartViewToggle)
}
const clickOnCreateCustomSmartBlock = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.createCusotmSmartBlock)
}
const inputBlockTitle = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.blockTitle, data.customSmartBlockData.SmartBlockData.block_title)
}
const inputBlockDescription = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.blobkDescription, data.customSmartBlockData.SmartBlockData.block_description)
}
const clickOnSmartAddFieldButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.blockAddFieldButton)
}
const inputOptionTitle = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.optionTitle, data.customSmartBlockData.SmartBlockData.option_title)
}
const dropdownReviewRequired = () => {
    pages.generalActions.typeInDropdownInput(elements.customSmartBlockElements.reviewRequired, data.customSmartBlockData.SmartBlockData.no_review_required)
}
const inputSecondOptionTitle = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.secondOptionTitle, data.customSmartBlockData.SmartBlockData.second_option_title)
}
const dropdownSecondReviewRequired = () => {
    pages.generalActions.typeInDropdownInput(elements.customSmartBlockElements.secondReviewRequired, data.customSmartBlockData.SmartBlockData.no_review_required)
}
const clickOnCloseButton = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.closeButton)
}
const clickOnLogicalForm = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.logicalForm)
}
const logicalFormDragandDropUSHolder = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.USHolderBlock, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionUSHolder = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.canvasUSHolderBlock, 70, 140)
}
const logicalFormDragandDropUSAcc = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.USAUSAccBlock, elements.customSmartBlockElements.reactCanvas)
}
const clickOnUSHolderBlock = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.linkUSHolder)
}
const clickOnUSAccBlock = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.USUSAccParentTopLink)
}
const canvasDragandDropPositionUSAcc = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.canvasUSAccBlock, 400, 700)
}
const clickOnFitView = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.fitViewPane)
}
const clickOnUSAccBlockForSelection = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.canvasUSHolderBlock)
}
const logicalFormDragandDropQualifiedPurchaser = () => {
    pages.generalActions.dragandDrop(elements.customSmartBlockElements.QuaPurBlock, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropKnowledgeableEmployee = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.USAUSKnwEmpBlock, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropFinalBlock = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.dragandDrop(elements.customSmartBlockElements.USFinalBlock, elements.customSmartBlockElements.reactCanvas)
}
const clickOnUSAccBlockBottom = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.bottomlinkUSAcc)
}
const clickOnQPtop = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.topLinkQP)
}
const canvasDragandDropPositionQP = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.canvasQPBlock, 500, 600)
}
const canvasDragandDropPositionKnowEmp = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.canvasKnowEmpBlock, 300, 400)
}
const clickOnKnowEmpBlockBottom = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.linkUSHolder)
}
const clickOnFinalBlock = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.topFinalBlock)
}
const clickOnPreviewButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.previewButton)
}
const clickOnUSHolderOption = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.countrySelection)
}
const clickOnQPOption = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.QPSelection)
}
const clickOncanvasUSAccBlock = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.canvasUSAccBlock)
}
const clickOnUSAccBlockTopNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.selectedTopNode)
}
const clickOnUSHolderYesBottomNode = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingXpath(elements.customSmartBlockElements.USHolderYesBottomNode)
}
const clickOnUSAccBlockBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.USAccBlockBottomNode)
}
const clickOnKnwEmpBlockTopNode = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.selectedTopNode)
}
const clickOnKnwEmpBlockBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.KnwEmpBlockBottomNode)
}
const clickOnQuaPurTopNode = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.selectedTopNode)
}
const logicalFormDragandDropAusWholeSale = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.ausWholeSaleBlock, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionAusWholeSale = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.ausWholeSaleBlockCanvas, 1000, 800)
}
const clickOnUSHolderNoBottomNode = () => {
    pages.generalActions.clickButtonUsingXpath(elements.customSmartBlockElements.USHolderNoBottomNode)
}
const clickOnausWholeSaleBlockTopNode = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.selectedTopNode)
}
const logicalFormDragandDropAusSophInvsRule = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.ausSophInvR, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionausSophInvR = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.ausSophInvRCanvas, 1600, 800)
}
const clickOnausWholeSaleBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.ausWholeSaleBottomNode)
}
const clickOnausSophInvRTopNode = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.ausSophInvRTopNode)
}
const logicalFormDragandDropausProfInvRule = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.ausProfInvRule, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionaausProfInv = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.ausProfInvRCanvas, 1400, 800)
}
const clickOnausSophInveRBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.ausSophInveRBottomNode)
}
const clickOnausProfInvRTopNode = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.ausProfInvRTopNode)
}
const logicalFormDragandDropfinalBlock = () => {
    pages.generalActions.dragandDrop(elements.customSmartBlockElements.finalBlock, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionaausProfInvRCanvas = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.ausProfInvRCanvas, 1400, 800)
}
const clickOnausProfInvRBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.ausProfInvRBottomNode)
}
const clickOnfinalBlockTopNode = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.finalBlockTopNode)
}
const clickOnwholesaleclientoption = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.wholesaleclientoption)
}
const clickOnsophisticatedInvestor = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.sophisticatedInvestor)
}
const clickOnprofessionalInvestor = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.professionalInvestor)
}
const clickOnnotUSAeligible = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.notUSAeligible)
}
const clickOnbackToEditButton = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.backToEditButton)
}
const logicalFormDragandDropQualifiedPurchaserUS = () => {
    pages.generalActions.dragandDrop(elements.customSmartBlockElements.USQuaPurBlockUS, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropCNLegitimate = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.CNlegitimate, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionCNLegitimate = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.CNlegitimateCanvas, 1000, 800)
}
const clickOnCNqpBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.CNqpBottomNode)
}
const clickOnCNqpTopNode = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.CNlegitimateTopNode)
}
const clickOnCNlegitimateBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.CNlegitimateBottomNode)
}
const logicalFormDragandCNfinalBlock = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.dragandDrop(elements.customSmartBlockElements.CNFinalBlock, elements.customSmartBlockElements.reactCanvas)
}
const clickOnlegitimateOption = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.legitimateOption)
}
const inputBlockTitleJPind = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.typeInInput(elements.customSmartBlockElements.TitleJPind, data.customSmartBlockData.SmartBlockData.block_title_jp_ind)
}
const inputBlockDescriptionJPind = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.DescriptionJPind, data.customSmartBlockData.SmartBlockData.block_description_jp_ind)
}
const inputOptionTitleJP = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.optionTitleJPind, data.customSmartBlockData.SmartBlockData.option_title_JP)
}
const dropdownReviewRequiredJP = () => {
    pages.generalActions.typeInDropdownInput(elements.customSmartBlockElements.reviewRequiredJP, data.customSmartBlockData.SmartBlockData.review_required_JP)
}
const dropdownreviewRequiredSecondJP = () => {
    pages.generalActions.typeInDropdownInput(elements.customSmartBlockElements.reviewRequiredSecondJP, data.customSmartBlockData.SmartBlockData.review_required_JP)
}
const inputoptionTitleSecondJPind = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.optionTitleSecondJPind, data.customSmartBlockData.SmartBlockData.option_title_second_JP)
}
const clickOncreateCusotmSmartBlockJP = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.createCusotmSmartBlockJP)
}
const clickOnaddFieldJP = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.addFieldJP)
}
const inputBlockTitleDis = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.typeInInput(elements.customSmartBlockElements.TitleJPind, data.customSmartBlockData.SmartBlockData.block_title_dis)
}
const inputBlockDescriptionDis = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.DescriptionJPind, data.customSmartBlockData.SmartBlockData.block_description_dis)
}
const inputOptionTitleDis = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.optionTitleJPind, data.customSmartBlockData.SmartBlockData.option_title_Dis)
}
const inputoptionTitleSecondDis = () => {
    pages.generalActions.typeInInput(elements.customSmartBlockElements.optionTitleSecondJPind, data.customSmartBlockData.SmartBlockData.option_title_second_Dis)
}
const logicalFormDragandDropUSHolderJP = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.dragandDrop(elements.customSmartBlockElements.jpUSHolder, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropUSAccJP = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.jpUSAcc, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropKnowledgeableEmployeeJP = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.USAUSKnwEmpBlock, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropQualifiedPurchaserJP = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.jpQuaPur, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropJPeligibleRule = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.jpEligibleRule, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionjpEligibleRuleCanvas = () => {
    pages.generalActions.canvasDragandDrop(elements.customSmartBlockElements.jpEligibleRuleCanvas, 1000, 800)
}
const clickOnjpEligibleRuleBottomNode = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.jpEligibleRuleTopNode)
}
const clickOnJPqpBottomNode = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.CNqpBottomNode)
}
const logicalFormDragandjpfinalBlock = () => {
    pages.generalActions.dragandDrop(elements.customSmartBlockElements.jpFinalBlock, elements.customSmartBlockElements.reactCanvas)
}
const logicalFormDragandDropjpJPIndInvs = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.jpJPIndInvs, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionjpJPIndInvsCanvas = () => {
    pages.generalActions.canvasDragandDropUsingXpath(elements.customSmartBlockElements.jpJPIndInvsCanvas, 1200, 800)
}
const clickOnjpEligibleRuleBottomNodes = () => {
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.jpEligibleRuleBottomNode)
}
const clickOnjpjpJPIndInvsBottomNode = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.jpjpJPIndInvsTopNode)
}
const logicalFormDragandDropjpDisqualifyingInvs = () => {
    pages.generalActions.dragandDropUsingXpath(elements.customSmartBlockElements.jpDisqualifyingInvs, elements.customSmartBlockElements.reactCanvas)
}
const canvasDragandDropPositionjpDisqualifyingInvsCanvas = () => {
    pages.generalActions.canvasDragandDropUsingXpath(elements.customSmartBlockElements.jpDisqualifyingInvsCanvas, 1400, 800)
}
const clickOnjpjpJPIndInvsBottomNodes = () => {
    pages.generalActions.clickButtonUsingXpath(elements.customSmartBlockElements.jpjpJPIndInvsBottomNode)
}
const clickOnjpDisqualifyingInvsTopNode = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.jpDisqualifyingInvsTopNode)
}
const clickOnjpDisqualifyingInvsBottomNode = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingXpath(elements.customSmartBlockElements.jpDisqualifyingInvsBottomNode)
}
const clickOnjpUSHolderNoOptionBottomNode = () => {
    pages.generalActions.clickButtonUsingXpath(elements.customSmartBlockElements.jpUSHolderNoOptionBottomNode)
}
const clickOnjpjpEligibilityRuleTopNode = () => {
    pages.generalActions.waitForTime(3000)
    pages.generalActions.clickButtonUsingXpath(elements.customSmartBlockElements.jpEligibilityRuleTopNode)
}
const clickOnjpInvestingOption = () => {
    pages.generalActions.waitForTime(1000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.jpInvestingOption)
}
const clickOnIndProfInvs = () => {
    pages.generalActions.waitForTime(1000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.jpDisqualifyingOption)
}
const clickOnjpDisqualifyingOption = () => {
    pages.generalActions.waitForTime(1000)
    pages.generalActions.clickButtonUsingLocator(elements.customSmartBlockElements.jpDisqualifyingOption)
}
const customSmartBlockActions = {
    clickOnSmartViewToggle,
    clickOnCreateCustomSmartBlock,
    inputBlockTitle,
    inputBlockDescription,
    clickOnSmartAddFieldButton,
    inputOptionTitle,
    dropdownReviewRequired,
    inputSecondOptionTitle,
    dropdownSecondReviewRequired,
    clickOnCloseButton,
    clickOnLogicalForm,
    logicalFormDragandDropUSAcc,
    canvasDragandDropPositionUSHolder,
    logicalFormDragandDropUSHolder,
    clickOnUSHolderBlock,
    clickOnUSAccBlock,
    canvasDragandDropPositionUSAcc,
    clickOnFitView,
    clickOnUSAccBlockForSelection,
    logicalFormDragandDropQualifiedPurchaser,
    logicalFormDragandDropKnowledgeableEmployee,
    logicalFormDragandDropFinalBlock,
    clickOnUSAccBlockBottom,
    clickOnQPtop,
    canvasDragandDropPositionQP,
    canvasDragandDropPositionKnowEmp,
    clickOnKnowEmpBlockBottom,
    clickOnFinalBlock,
    clickOnPreviewButton,
    clickOnUSHolderOption,
    clickOnQPOption,
    clickOncanvasUSAccBlock,
    clickOnUSAccBlockTopNode,
    clickOnUSHolderYesBottomNode,
    clickOnUSAccBlockBottomNode,
    clickOnKnwEmpBlockTopNode,
    clickOnKnwEmpBlockBottomNode,
    clickOnQuaPurTopNode,
    logicalFormDragandDropAusWholeSale,
    canvasDragandDropPositionAusWholeSale,
    clickOnUSHolderNoBottomNode,
    clickOnausWholeSaleBlockTopNode,
    logicalFormDragandDropAusSophInvsRule,
    canvasDragandDropPositionausSophInvR,
    clickOnausWholeSaleBottomNode,
    clickOnausSophInvRTopNode,
    logicalFormDragandDropausProfInvRule,
    canvasDragandDropPositionaausProfInv,
    clickOnausSophInveRBottomNode,
    clickOnausProfInvRTopNode,
    logicalFormDragandDropfinalBlock,
    canvasDragandDropPositionaausProfInvRCanvas,
    clickOnausProfInvRBottomNode,
    clickOnfinalBlockTopNode,
    clickOnwholesaleclientoption,
    clickOnsophisticatedInvestor,
    clickOnprofessionalInvestor,
    clickOnnotUSAeligible,
    clickOnbackToEditButton,
    logicalFormDragandDropQualifiedPurchaserUS,
    logicalFormDragandDropCNLegitimate,
    canvasDragandDropPositionCNLegitimate,
    clickOnCNqpBottomNode,
    clickOnCNqpTopNode,
    clickOnCNlegitimateBottomNode,
    logicalFormDragandCNfinalBlock,
    clickOnlegitimateOption,
    inputBlockTitleJPind,
    inputBlockDescriptionJPind,
    inputOptionTitleJP,
    dropdownReviewRequiredJP,
    dropdownreviewRequiredSecondJP,
    inputoptionTitleSecondJPind,
    clickOncreateCusotmSmartBlockJP,
    clickOnaddFieldJP,
    inputBlockTitleDis,
    inputBlockDescriptionDis,
    inputOptionTitleDis,
    inputoptionTitleSecondDis,
    logicalFormDragandDropUSHolderJP,
    logicalFormDragandDropUSAccJP,
    logicalFormDragandDropKnowledgeableEmployeeJP,
    logicalFormDragandDropQualifiedPurchaserJP,
    logicalFormDragandDropJPeligibleRule,
    canvasDragandDropPositionjpEligibleRuleCanvas,
    clickOnjpEligibleRuleBottomNode,
    clickOnJPqpBottomNode,
    logicalFormDragandjpfinalBlock,
    logicalFormDragandDropjpJPIndInvs,
    canvasDragandDropPositionjpJPIndInvsCanvas,
    clickOnjpjpJPIndInvsBottomNode,
    clickOnjpEligibleRuleBottomNodes,
    logicalFormDragandDropjpDisqualifyingInvs,
    canvasDragandDropPositionjpDisqualifyingInvsCanvas,
    clickOnjpjpJPIndInvsBottomNodes,
    clickOnjpDisqualifyingInvsTopNode,
    clickOnjpDisqualifyingInvsBottomNode,
    clickOnjpUSHolderNoOptionBottomNode,
    clickOnjpjpEligibilityRuleTopNode,
    clickOnjpInvestingOption,
    clickOnIndProfInvs,
    clickOnjpDisqualifyingOption





}

export default customSmartBlockActions