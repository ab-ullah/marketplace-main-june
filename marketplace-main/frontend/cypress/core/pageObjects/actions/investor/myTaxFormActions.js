import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'


const verifyHeaderTileTaxForm = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.titleHeader).should("be.visible")

}

const verifyCountryHeading = () => {

    pages.generalActions.verifyElementsText(elements.myTaxFormElement.countryHeading, data.my_Tax_Form_Data.myTax.country_heading)

}
const verifyCountryDescription = () => {

    pages.generalActions.verifyElementsText(elements.myTaxFormElement.countryDesctiption, data.my_Tax_Form_Data.myTax.country_desctiption)

}
const verifyCountryInput = () => {

    pages.generalActions.verifyFieldValue(elements.myTaxFormElement.countryInput, data.my_Tax_Form_Data.myTax.country_input)

}
const verifyCountryInputIn = () => {

    pages.generalActions.verifyFieldValue(elements.myTaxFormElement.countryInput, data.my_Tax_Form_Data.myTax.country_input_In)

}
const selectCountryInputIn = () => {

    pages.generalActions.typeInDropdownInput(elements.myTaxFormElement.countryDropdown, data.my_Tax_Form_Data.myTax.country_input)

}
const clickOnDeleteExitingCountry = () => {

    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.delteCountry)

}
const clickOnNextButton = () => {

    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.clickOnNextButton)

}
const verifyBackButton = () => {

    pages.generalActions.verifyElementOnPage(elements.myTaxFormElement.secondFormBackButton)

}

const verifySecondTaxForm = () => {

    pages.generalActions.verifyRadioButtonValue(elements.myTaxFormElement.USholder, data.my_Tax_Form_Data.myTax.us_holder)
    pages.generalActions.verifyRadioButtonValue(elements.myTaxFormElement.taxExempt, data.my_Tax_Form_Data.myTax.tax_exampt_under_section)
    pages.generalActions.verifyRadioButtonValue(elements.myTaxFormElement.examptOfTaxtation, data.my_Tax_Form_Data.myTax.exempt_of_taxtation)
    //Input New Value
    pages.generalActions.typeInInput(elements.myTaxFormElement.taxPayerIdentification, data.my_Tax_Form_Data.myTax.tax_payer_identification)
    pages.generalActions.verifyElementOnPage(elements.myTaxFormElement.taxableYear, data.my_Tax_Form_Data.myTax.taxable_year)
}
const verifySecondTaxFormLabels = () => {

    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.USholderLabel, data.my_Tax_Form_Data.myTax.US_holder_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.taxExemptLabel, data.my_Tax_Form_Data.myTax.tax_exempt_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.examptOfTaxtationLabel, data.my_Tax_Form_Data.myTax.exampt_of_taxtation_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.taxPayerIdentificationLabel, data.my_Tax_Form_Data.myTax.taxPayer_identification_label)
    //pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.taxableYearLabel, data.my_Tax_Form_Data.myTax.taxable_year_label)
}
const verifySecondTaxFormLabelsIN = () => {

    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.USholderLabel, data.my_Tax_Form_Data.myTax.US_holder_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.taxExemptLabel, data.my_Tax_Form_Data.myTax.tax_exempt_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.examptOfTaxtationLabel, data.my_Tax_Form_Data.myTax.exampt_of_taxtation_label)
    pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.taxPayerIdentificationLabel, data.my_Tax_Form_Data.myTax.taxPayer_identification_label)
    //pages.generalActions.verifyFieldsLabelUsingLocator(elements.myTaxFormElement.taxableYearLabelIn, data.my_Tax_Form_Data.myTax.taxable_year_label)
}
const clickonNextButton = () => {

    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.nextButtonClick)
}
const clickonNextButtonTax = () => {
    pages.generalActions.waitForTime(2000)
    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.nextButtonClicktax)
}
const clickonNextButtondb = () => {

    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.nextButtonClick)
    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.nextButtonClick)
}

const investorTaxFormTable = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.tablePresent).should("be.visible")
}
const verifyInputCheckboxes = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.firstInputCheckbox).should("be.visible")
    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.secondInputCheckbox).should("be.visible")
    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.thirdInputCheckbox).should("be.visible")
    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.fouthInputCheckbox).should("be.visible")
}
const vefiytableHeader = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.firstInputCheckbox).should("be.visible")

}
const clickOnNextButtonTaxForm = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.taxFormNextButton).click()
    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.taxFormNextButton).click()
}
const clickOnNextButtonTaxFormSinglepage = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.taxFormNextButton).click({
        force: true
    })

}
const clickOnChangeFormButton = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.changeFormsButton).click()

}
const selectTaxFormW9Form = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.taxFormW9Form).check()
}
const selectTBBENForm = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.taxFormBBEN).check()
}
const deleteLastFormDocument = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.deleteTaxFormDocumnetlast).click()

}

const checkIndividualCertificate = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.indivudualCertificate).check({
        force: true
    })
}
const verifyGotoapplicationLink = () => {

    pages.generalActions.getElementUsingLabel(data.my_Tax_Form_Data.myTax.self_certifcate_page_link)
}
const clickOnDeleteicon = () => {

    pages.generalActions.getElementUsingLocator(elements.myTaxFormElement.deleteTaxFormDocumnet).click()
}
const clickonNextButtonMultiple = () => {

    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.nextButtonClick)
}
const fillTaxGlobalFormDocusign = () => {

    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.globalform)
    pages.generalActions.waitForTime(20000)
    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.docusignCountinueButton)
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignAccountHolder, "Mark Son")
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignDOB, "12/19/1990")
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignPlaceofBirth, "NY City")
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignpermanentAddress, "LarkField")
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignCity, "New York")
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignState, "New York")
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignPostCode, "10001")
    pages.generalActions.typeInInput(elements.myTaxFormElement.docusignCountry, "USA")
    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.sectionCheckBoxFirst)
    pages.generalActions.typeInInput(elements.myTaxFormElement.sectionTwoInput, "Test")
    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.sectionCheckBoxSecond)
    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.sectionCheckBoxThird)
    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.sign)
    pages.generalActions.typeInInput(elements.myTaxFormElement.dateEnd, "12/19/2000")

}
const clickonFinishDocusign = () => {

    pages.generalActions.clickButtonUsingLocator(elements.myTaxFormElement.finishButton)
}
const taxFormCompletedVerificationAlert = () => {

    pages.generalActions.verifyElementOnPage(elements.myTaxFormElement.taxFormVerification, data.my_Tax_Form_Data.myTax.tax_form_alert)
}
const myTaxFormActions = {

    verifyHeaderTileTaxForm,
    verifyCountryHeading,
    verifyCountryDescription,
    verifyCountryInput,
    clickOnNextButton,
    verifyBackButton,
    verifySecondTaxForm,
    verifySecondTaxFormLabels,
    clickonNextButton,
    investorTaxFormTable,
    verifyInputCheckboxes,
    selectTBBENForm,
    vefiytableHeader,
    clickOnNextButtonTaxForm,
    selectTaxFormW9Form,
    clickOnNextButtonTaxFormSinglepage,
    checkIndividualCertificate,
    verifyGotoapplicationLink,
    clickOnChangeFormButton,
    clickOnDeleteicon,
    deleteLastFormDocument,
    clickonNextButtondb,
    clickonNextButtonMultiple,
    fillTaxGlobalFormDocusign,
    clickonFinishDocusign,
    taxFormCompletedVerificationAlert,
    verifyCountryInputIn,
    selectCountryInputIn,
    clickOnDeleteExitingCountry,
    verifySecondTaxFormLabelsIN,
    clickonNextButtonTax

}

export default myTaxFormActions