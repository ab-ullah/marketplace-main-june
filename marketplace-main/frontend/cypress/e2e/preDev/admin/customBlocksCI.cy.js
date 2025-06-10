import * as pages from '../../../core/pageObjects/pages'
import * as data from '../../../fixtures/data'


describe('Custom Smart Block Suite', () => {


    context('TC01 Create Eligibility-US', () => {


        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it('Verify Admin Creates a Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()
            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.clickOnSaveButton()
            pages.createFundActions.goToHomepageButton()
        })
        it('Click on Latest Fund from Funds Col', () => {
            pages.homeActions.clickOn1stFundTitleInTheTable()
        });
        it('Admin creates a new eligibility criteria', {
            scrollBehavior: false
        }, () => {

            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.customSmartBlockActions.clickOnSmartViewToggle()
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.customSmartBlockActions.clickOnCreateCustomSmartBlock()

        })
        it("Create Custom Block-US", () => {

            pages.generalActions.waitForTime(2000)
            pages.customSmartBlockActions.inputBlockTitle()
            pages.customSmartBlockActions.inputBlockDescription()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputOptionTitle()
            pages.customSmartBlockActions.dropdownReviewRequired()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputSecondOptionTitle()
            pages.customSmartBlockActions.dropdownSecondReviewRequired()
            pages.customSmartBlockActions.clickOnCloseButton()
            pages.customSmartBlockActions.clickOnLogicalForm()


        })
        it("Country Selector and US Accredited Investor Drag/ Link", () => {

            pages.customSmartBlockActions.logicalFormDragandDropUSHolder()
            pages.customSmartBlockActions.canvasDragandDropPositionUSHolder()
            pages.customSmartBlockActions.logicalFormDragandDropUSAcc()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.canvasDragandDropPositionUSAcc()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.clickOnUSAccBlockForSelection()
            pages.customSmartBlockActions.clickOnUSHolderBlock()
            pages.customSmartBlockActions.clickOnUSAccBlock()
        })
        it("US Accredited Investor and Qualified Purchaser Drag/ Link", () => {

            pages.customSmartBlockActions.logicalFormDragandDropQualifiedPurchaserUS()
            pages.customSmartBlockActions.clickOnUSAccBlockBottom()
            pages.customSmartBlockActions.clickOnQPtop()
            pages.customSmartBlockActions.canvasDragandDropPositionQP()

        })
        it("Knowledgeable Employee and Final Block Drag/ Link", () => {
            pages.customSmartBlockActions.logicalFormDragandDropKnowledgeableEmployee()
            pages.customSmartBlockActions.canvasDragandDropPositionKnowEmp()
            pages.customSmartBlockActions.logicalFormDragandDropFinalBlock()
            pages.customSmartBlockActions.clickOnKnowEmpBlockBottom()
            pages.customSmartBlockActions.clickOnFinalBlock()
        })
        it('C96087 C96090: Verify Blocks and Fill Preview Form', {
            scrollBehavior: false
        }, () => {
            pages.customSmartBlockActions.clickOnPreviewButton()

            // Fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill second form-US Holder
            pages.customSmartBlockActions.clickOnUSHolderOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill US Accredited Form
            pages.previewEligibilityFormActions.fillAccreditedForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Qualified Purchaser Form
            pages.customSmartBlockActions.clickOnQPOption()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Knowlodgeable Employee Form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()
        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC02 Create Eligibility-Australia', () => {


        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it.skip('Verify Admin Creates a Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()
            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.clickOnSaveButton()
            pages.createFundActions.goToHomepageButton()
        })
        it('Click on Latest Fund from Funds Col', {
            scrollBehavior: false
        }, () => {

            pages.homeActions.clickOn1stFundTitleInTheTable()
        })
        it('Admin creates a new eligibility criteria for Australia', {
            scrollBehavior: false
        }, () => {

            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.customSmartBlockActions.clickOnSmartViewToggle()
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.customSmartBlockActions.clickOnCreateCustomSmartBlock()
        })
        it("Create Custom Block-US", () => {

            pages.generalActions.waitForTime(2000)
            pages.customSmartBlockActions.inputBlockTitle()
            pages.customSmartBlockActions.inputBlockDescription()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputOptionTitle()
            pages.customSmartBlockActions.dropdownReviewRequired()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputSecondOptionTitle()
            pages.customSmartBlockActions.dropdownSecondReviewRequired()
            pages.customSmartBlockActions.clickOnCloseButton()
            pages.customSmartBlockActions.clickOnLogicalForm()


        })
        it("Country Selector and US Accredited Investor Drag/ Link With 'Yes' Option", () => {

            pages.customSmartBlockActions.logicalFormDragandDropUSHolder()
            pages.customSmartBlockActions.canvasDragandDropPositionUSHolder()
            pages.customSmartBlockActions.logicalFormDragandDropUSAcc()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.canvasDragandDropPositionUSAcc()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.clickOnUSAccBlockForSelection()
            pages.customSmartBlockActions.clickOncanvasUSAccBlock()
            pages.customSmartBlockActions.clickOnUSAccBlockTopNode()
            pages.customSmartBlockActions.clickOnUSHolderYesBottomNode()

        })
        it("Knowledgeable Employee and Qualified Purchaser Drag & Link", () => {

            pages.customSmartBlockActions.logicalFormDragandDropKnowledgeableEmployee()
            pages.customSmartBlockActions.canvasDragandDropPositionKnowEmp()
            pages.customSmartBlockActions.clickOnUSAccBlockBottomNode()
            pages.customSmartBlockActions.clickOnKnwEmpBlockTopNode()
            pages.customSmartBlockActions.logicalFormDragandDropQualifiedPurchaser()
            pages.customSmartBlockActions.canvasDragandDropPositionQP()
            pages.customSmartBlockActions.clickOnKnwEmpBlockBottomNode()
            pages.customSmartBlockActions.clickOnQuaPurTopNode()

        })
        it("Australia Wholesale Client Rule Drag/ Link With 'No' Option", () => {

            pages.customSmartBlockActions.logicalFormDragandDropAusWholeSale()
            pages.customSmartBlockActions.canvasDragandDropPositionAusWholeSale()
            pages.customSmartBlockActions.clickOnUSHolderNoBottomNode()
            pages.customSmartBlockActions.clickOnausWholeSaleBlockTopNode()


        })
        it("Australia Sophisticated Investor Rule Drag & Link With Australia Wholesale Client Rule", () => {
            pages.customSmartBlockActions.logicalFormDragandDropAusSophInvsRule()
            pages.customSmartBlockActions.canvasDragandDropPositionausSophInvR()
            pages.customSmartBlockActions.clickOnausWholeSaleBottomNode()
            pages.customSmartBlockActions.clickOnausSophInvRTopNode()

        })
        it("Australia Professional Investor Rule Drag & Link With Australia Sophisticated Investor Rule", () => {
            pages.customSmartBlockActions.logicalFormDragandDropausProfInvRule()
            pages.customSmartBlockActions.canvasDragandDropPositionaausProfInv()
            pages.customSmartBlockActions.clickOnausSophInveRBottomNode()
            pages.customSmartBlockActions.clickOnausProfInvRTopNode()

        })
        it("Final Block Drag & Link With Australia Profissional Investor Rule", () => {

            pages.customSmartBlockActions.logicalFormDragandDropfinalBlock()
            pages.customSmartBlockActions.canvasDragandDropPositionaausProfInvRCanvas()
            pages.customSmartBlockActions.clickOnausProfInvRBottomNode()
            pages.customSmartBlockActions.clickOnfinalBlockTopNode()


        })
        it('Verify Blocks and Fill Preview Form-If User is US Eligible', {
            scrollBehavior: false
        }, () => {

            pages.customSmartBlockActions.clickOnPreviewButton()

            // Fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill second form-US Holder-If YES
            pages.customSmartBlockActions.clickOnUSHolderOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill US Accredited Form
            pages.previewEligibilityFormActions.fillAccreditedForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Knowlodgeable Employee Form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Qualified Purchaser Form
            pages.customSmartBlockActions.clickOnQPOption()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill wholesale client Form
            pages.customSmartBlockActions.clickOnwholesaleclientoption()
            pages.previewEligibilityFormActions.clickOnNextButton()


            // Fill sophisticated investor Form
            pages.customSmartBlockActions.clickOnsophisticatedInvestor()
            pages.previewEligibilityFormActions.clickOnNextButton()


            // Fill professional investor Form
            pages.customSmartBlockActions.clickOnprofessionalInvestor()
            pages.previewEligibilityFormActions.clickOnNextButton()

        })
        it('C96088: Verify Blocks and Fill Preview Form-If User is NOT US Eligible', {
            scrollBehavior: false
        }, () => {
            pages.customSmartBlockActions.clickOnbackToEditButton()
            pages.customSmartBlockActions.clickOnPreviewButton()

            // Fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill second form-US Holder-If YES
            pages.customSmartBlockActions.clickOnnotUSAeligible()
            pages.previewEligibilityFormActions.clickOnNextButton()


            // Fill wholesale client Form
            pages.customSmartBlockActions.clickOnwholesaleclientoption()
            pages.previewEligibilityFormActions.clickOnNextButton()


            // Fill sophisticated investor Form
            pages.customSmartBlockActions.clickOnsophisticatedInvestor()
            pages.previewEligibilityFormActions.clickOnNextButton()


            // Fill professional investor Form
            pages.customSmartBlockActions.clickOnprofessionalInvestor()
            pages.previewEligibilityFormActions.clickOnNextButton()

        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC03 Create Eligibility-China', () => {


        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it.skip('Verify Admin Creates a Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()
            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.clickOnSaveButton()
            pages.createFundActions.goToHomepageButton()
        })
        it('Click on Latest Fund from Funds Col', {
            scrollBehavior: false
        }, () => {

            pages.homeActions.clickOn1stFundTitleInTheTable()
        })
        it('Admin creates a new eligibility criteria for China', {
            scrollBehavior: false
        }, () => {

            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.customSmartBlockActions.clickOnSmartViewToggle()
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.customSmartBlockActions.clickOnCreateCustomSmartBlock()
        })
        it("Create Custom Block-US", () => {

            pages.generalActions.waitForTime(2000)
            pages.customSmartBlockActions.inputBlockTitle()
            pages.customSmartBlockActions.inputBlockDescription()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputOptionTitle()
            pages.customSmartBlockActions.dropdownReviewRequired()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputSecondOptionTitle()
            pages.customSmartBlockActions.dropdownSecondReviewRequired()
            pages.customSmartBlockActions.clickOnCloseButton()
            pages.customSmartBlockActions.clickOnLogicalForm()


        })
        it("Country Selector and US Accredited Investor Drag/ Link With 'Yes' Option", () => {

            pages.customSmartBlockActions.logicalFormDragandDropUSHolder()
            pages.customSmartBlockActions.canvasDragandDropPositionUSHolder()
            pages.customSmartBlockActions.logicalFormDragandDropUSAcc()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.canvasDragandDropPositionUSAcc()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.clickOnUSAccBlockForSelection()
            pages.customSmartBlockActions.clickOncanvasUSAccBlock()
            pages.customSmartBlockActions.clickOnUSAccBlockTopNode()
            pages.customSmartBlockActions.clickOnUSHolderYesBottomNode()

        })
        it("Knowledgeable Employee and Qualified Purchaser Drag & Link", () => {

            pages.customSmartBlockActions.logicalFormDragandDropKnowledgeableEmployee()
            pages.customSmartBlockActions.canvasDragandDropPositionKnowEmp()
            pages.customSmartBlockActions.clickOnUSAccBlockBottomNode()
            pages.customSmartBlockActions.clickOnKnwEmpBlockTopNode()
            pages.customSmartBlockActions.logicalFormDragandDropQualifiedPurchaser()
            pages.customSmartBlockActions.canvasDragandDropPositionQP()
            pages.customSmartBlockActions.clickOnKnwEmpBlockBottomNode()
            pages.customSmartBlockActions.clickOnQuaPurTopNode()


        })
        it("CN Legitimate Oversea Assets Drag/ Link With Qualified Purchaser", () => {

            pages.customSmartBlockActions.logicalFormDragandDropCNLegitimate()
            pages.customSmartBlockActions.canvasDragandDropPositionCNLegitimate()
            pages.customSmartBlockActions.clickOnCNqpBottomNode()
            pages.customSmartBlockActions.clickOnCNqpTopNode()



        })
        it("Final Block Drag & Link With CN Legitimate Oversea Assets", () => {

            pages.customSmartBlockActions.logicalFormDragandCNfinalBlock()
            //pages.customSmartBlockActions.canvasDragandDropPositionaausProfInvRCanvas()
            pages.customSmartBlockActions.clickOnCNlegitimateBottomNode()
            pages.customSmartBlockActions.clickOnfinalBlockTopNode()


        })
        it('C96089: Verify Blocks and Fill Preview Form-If User is US Eligible', {
            scrollBehavior: false
        }, () => {

            pages.customSmartBlockActions.clickOnPreviewButton()

            // Fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill second form-US Holder-If YES
            pages.customSmartBlockActions.clickOnUSHolderOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill US Accredited Form
            pages.previewEligibilityFormActions.fillAccreditedForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Knowlodgeable Employee Form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Qualified Purchaser Form
            pages.customSmartBlockActions.clickOnQPOption()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill legitimate oversea assets/loans Form
            pages.customSmartBlockActions.clickOnlegitimateOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })

    })

    context('TC04 Create Eligibility-Japan', () => {


        before(() => {
            pages.generalActions.conditionalLoginForAdmin()
        })

        it.skip('Verify Admin Creates a Fund', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOnCreateFundBtn()
            pages.createFundActions.fillCreateFundForm()
            pages.createFundActions.clickOnCreateButton()
            pages.createFundActions.verifyFundTitle()
            pages.createFundActions.verifyFundData()
            pages.createFundActions.scrollToSaveButton()
            pages.createFundActions.clickOnSaveButton()
            pages.createFundActions.goToHomepageButton()
        })
        it('Click on Latest Fund from Funds Col', {
            scrollBehavior: false
        }, () => {
            pages.homeActions.clickOn1stFundTitleInTheTable()
        })
        it('Admin creates a new eligibility criteria for Japan', {
            scrollBehavior: false
        }, () => {

            pages.eligibilityCriteriaActions.clickOnEligibilityTab()
            pages.eligibilityCriteriaActions.clickOnCreateEligibilityButton()
            pages.eligibilityCriteriaActions.fillEligibilityInitialPopupForm(data.fundData.createFund.country)
            pages.customSmartBlockActions.clickOnSmartViewToggle()
            pages.eligibilityCriteriaActions.clickOnNextButtonInPopup()
            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.customSmartBlockActions.clickOnCreateCustomSmartBlock()
        })
        it("Create Custom Block-US Holder", () => {

            pages.generalActions.waitForTime(2000)
            pages.customSmartBlockActions.inputBlockTitle()
            pages.customSmartBlockActions.inputBlockDescription()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputOptionTitle()
            pages.customSmartBlockActions.dropdownReviewRequired()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputSecondOptionTitle()
            pages.customSmartBlockActions.dropdownSecondReviewRequired()
            pages.customSmartBlockActions.clickOnCloseButton()
            //pages.customSmartBlockActions.clickOnLogicalForm()


        })
        it("Create Custom Block-JP Individual Professional Investor", () => {

            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.customSmartBlockActions.clickOncreateCusotmSmartBlockJP()
            pages.customSmartBlockActions.inputBlockTitleJPind()
            pages.customSmartBlockActions.inputBlockDescriptionJPind()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputOptionTitleJP()
            pages.customSmartBlockActions.dropdownReviewRequiredJP()
            pages.customSmartBlockActions.clickOnaddFieldJP()
            pages.customSmartBlockActions.inputoptionTitleSecondJPind()
            pages.customSmartBlockActions.dropdownreviewRequiredSecondJP()
            pages.customSmartBlockActions.clickOnCloseButton()



        })
        it("Create Custom Block-Disqualifying Investor", () => {

            pages.createEligibilityFormActions.clickOnAddBlocksButton()
            pages.customSmartBlockActions.clickOncreateCusotmSmartBlockJP()
            pages.customSmartBlockActions.inputBlockTitleDis()
            pages.customSmartBlockActions.inputBlockDescriptionDis()
            pages.customSmartBlockActions.clickOnSmartAddFieldButton()
            pages.customSmartBlockActions.inputOptionTitleDis()
            pages.customSmartBlockActions.dropdownReviewRequiredJP()
            pages.customSmartBlockActions.clickOnaddFieldJP()
            pages.customSmartBlockActions.inputoptionTitleSecondJPind()
            pages.customSmartBlockActions.inputoptionTitleSecondDis()
            pages.customSmartBlockActions.clickOnCloseButton()
            pages.customSmartBlockActions.clickOnLogicalForm()

        })
        it("Country Selector and US Accredited Investor Drag/ Link With 'Yes' Option", () => {

            pages.customSmartBlockActions.logicalFormDragandDropUSHolderJP()
            pages.customSmartBlockActions.canvasDragandDropPositionUSHolder()
            pages.customSmartBlockActions.logicalFormDragandDropUSAccJP()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.canvasDragandDropPositionUSAcc()
            pages.customSmartBlockActions.clickOnFitView()
            pages.customSmartBlockActions.clickOnUSAccBlockForSelection()
            pages.customSmartBlockActions.clickOncanvasUSAccBlock()
            pages.customSmartBlockActions.clickOnUSAccBlockTopNode()
            pages.customSmartBlockActions.clickOnUSHolderYesBottomNode()

        })
        it("Knowledgeable Employee and Qualified Purchaser Drag & Link", () => {

            pages.customSmartBlockActions.logicalFormDragandDropKnowledgeableEmployeeJP()
            pages.customSmartBlockActions.canvasDragandDropPositionKnowEmp()
            pages.customSmartBlockActions.clickOnUSAccBlockBottomNode()
            pages.customSmartBlockActions.clickOnKnwEmpBlockTopNode()
            pages.customSmartBlockActions.logicalFormDragandDropQualifiedPurchaserJP()
            pages.customSmartBlockActions.canvasDragandDropPositionQP()
            pages.customSmartBlockActions.clickOnKnwEmpBlockBottomNode()
            pages.customSmartBlockActions.clickOnQuaPurTopNode()


        })
        it("Japan Eligible Rule Drag/ Link With Qualified Purchaser", () => {

            pages.customSmartBlockActions.logicalFormDragandDropJPeligibleRule()
            pages.customSmartBlockActions.canvasDragandDropPositionjpEligibleRuleCanvas()
            pages.customSmartBlockActions.clickOnJPqpBottomNode()
            pages.customSmartBlockActions.clickOnjpEligibleRuleBottomNode()




        })
        it("Japan Individual Professional Investor Drag/ Link with Japan Eligibility Rule", () => {

            pages.customSmartBlockActions.logicalFormDragandDropjpJPIndInvs()
            pages.customSmartBlockActions.canvasDragandDropPositionjpJPIndInvsCanvas()
            pages.customSmartBlockActions.clickOnjpEligibleRuleBottomNodes()
            pages.customSmartBlockActions.clickOnjpjpJPIndInvsBottomNode()

        })
        it("Disqualifying Investor Drag & Link with Japan Individual Professional Investor ", () => {

            pages.customSmartBlockActions.logicalFormDragandDropjpDisqualifyingInvs()
            pages.customSmartBlockActions.canvasDragandDropPositionjpDisqualifyingInvsCanvas()
            pages.customSmartBlockActions.clickOnjpjpJPIndInvsBottomNodes()
            pages.customSmartBlockActions.clickOnjpDisqualifyingInvsTopNode()

        })
        it("Final Block Drag & Link With Disqualifying Investor", () => {

            pages.customSmartBlockActions.logicalFormDragandjpfinalBlock()
            pages.customSmartBlockActions.clickOnjpDisqualifyingInvsBottomNode()
            pages.customSmartBlockActions.clickOnfinalBlockTopNode()


        })
        it("Qualified Purchaser Link with Japan Eligibility Rule", () => {

            pages.customSmartBlockActions.clickOnjpUSHolderNoOptionBottomNode()
            pages.customSmartBlockActions.clickOnjpjpEligibilityRuleTopNode()

        })
        it('Verify Blocks and Fill Preview Form-If User is US Eligible', {
            scrollBehavior: false
        }, () => {

            pages.customSmartBlockActions.clickOnPreviewButton()

            // Fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill second form-US Holder-If YES
            pages.customSmartBlockActions.clickOnUSHolderOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill US Accredited Form
            pages.previewEligibilityFormActions.fillAccreditedForm()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Knowlodgeable Employee Form
            pages.previewEligibilityFormActions.fillKnowledgeableEmployeeForm()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Qualified Purchaser Form
            pages.customSmartBlockActions.clickOnQPOption()
            pages.previewEligibilityFormActions.scrollToNextButton()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill How are you investing? Form
            pages.customSmartBlockActions.clickOnjpInvestingOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill JP Individual Professional Investor Form
            pages.customSmartBlockActions.clickOnIndProfInvs()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Disqualifying Investor Form
            pages.customSmartBlockActions.clickOnjpDisqualifyingOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

        })
        it('C96090: Verify Blocks and Fill Preview Form-If User is NOT US Eligible', {
            scrollBehavior: false
        }, () => {
            pages.customSmartBlockActions.clickOnbackToEditButton()
            pages.customSmartBlockActions.clickOnPreviewButton()

            // Fill first form
            pages.previewEligibilityFormActions.fillPreviewFormDataAdmin(data.eligibilityData.createEligibility.investment_country)
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill second form-US Holder-If YES
            pages.customSmartBlockActions.clickOnnotUSAeligible()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill How are you investing? Form
            pages.customSmartBlockActions.clickOnjpInvestingOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill JP Individual Professional Investor Form
            pages.customSmartBlockActions.clickOnIndProfInvs()
            pages.previewEligibilityFormActions.clickOnNextButton()

            // Fill Disqualifying Investor Form
            pages.customSmartBlockActions.clickOnjpDisqualifyingOption()
            pages.previewEligibilityFormActions.clickOnNextButton()

        })

        after(() => {
            pages.homeActions.clickOnLogoutButton()
        })



    })
})