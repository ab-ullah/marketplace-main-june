import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'


const selectBankLocation = () => {
    pages.generalActions.typeInDropdownInput(elements.myBankDetailElement.bankLocated, data.my_Bank_Detail_Data.myBankData.bank_located)
}
const bankDetailForm = () => {
    pages.generalActions.typeInInput(elements.myBankDetailElement.bankName, data.my_Bank_Detail_Data.myBankData.bank_name)
    pages.generalActions.typeInInput(elements.myBankDetailElement.bankSwift, data.my_Bank_Detail_Data.myBankData.bank_sift)
    pages.generalActions.verifyElementOnPage(elements.myBankDetailElement.bankIntermediarycheckbox)
    pages.generalActions.verifyElementsText(elements.myBankDetailElement.bankIntermediarycheckboxLabel, data.my_Bank_Detail_Data.myBankData.bank_Intermediary_checkbox_Label)
    pages.generalActions.checkBoxUsingLocator(elements.myBankDetailElement.bankIntermediarycheckbox)

    pages.generalActions.verifyElementOnPage(elements.myBankDetailElement.IntermediaryBankName)
    pages.generalActions.typeInInput(elements.myBankDetailElement.bankIntermediaryname, data.my_Bank_Detail_Data.myBankData.bank_intermediary_name)

    pages.generalActions.verifyElementOnPage(elements.myBankDetailElement.IntermediaryBanSwift)
    pages.generalActions.typeInInput(elements.myBankDetailElement.bankIntermediarySwiftCode, data.my_Bank_Detail_Data.myBankData.bank_intermediary_swift_code)

    pages.generalActions.typeInInput(elements.myBankDetailElement.streetAddress, data.my_Bank_Detail_Data.myBankData.bank_streetAddress)
    pages.generalActions.typeInInput(elements.myBankDetailElement.city, data.my_Bank_Detail_Data.myBankData.bank_city)
    pages.generalActions.typeInInput(elements.myBankDetailElement.province, data.my_Bank_Detail_Data.myBankData.bank_province)
    pages.generalActions.typeInInput(elements.myBankDetailElement.postalCode, data.my_Bank_Detail_Data.myBankData.bank_postalCode)
    pages.generalActions.typeInInput(elements.myBankDetailElement.accountName, data.my_Bank_Detail_Data.myBankData.bank_accountName)
    pages.generalActions.typeInInput(elements.myBankDetailElement.accountNumber, data.my_Bank_Detail_Data.myBankData.bank_accountNumber)
    pages.generalActions.typeInInput(elements.myBankDetailElement.ibanNumber, data.my_Bank_Detail_Data.myBankData.bank_ibanNumber)
    pages.generalActions.typeInInput(elements.myBankDetailElement.creditAccountName, data.my_Bank_Detail_Data.myBankData.bank_creditAccountName)
    pages.generalActions.typeInInput(elements.myBankDetailElement.creditAccountNumber, data.my_Bank_Detail_Data.myBankData.bank_creditAccountNumber)
    pages.generalActions.typeInDropdownInput(elements.myBankDetailElement.currency, data.my_Bank_Detail_Data.myBankData.bank_currency)
    pages.generalActions.typeInInput(elements.myBankDetailElement.reference, data.my_Bank_Detail_Data.myBankData.bank_reference)

}
const bankDetailSubmitButton = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.submitButton).click({
        force: true
    })
}
const clickonPreviewModal = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.powerofAttorneyEyeIcon).click({
        force: true
    })
}
const clickonModalCloseButton = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.CloseButtonProgramDocument).click({
        force: true
    })
}
const clickonModalDownloadButton = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.downloadModalButtonProgrameDocument).click({
        force: true
    })
}
const clickONextButton = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.clickOnNextButton).click({
        force: true
    })
}
const verifyTextOnReviewDocumentPage = () => {
    pages.generalActions.verifyFieldValue(elements.myBankDetailElement.acknowledgeText, data.my_Bank_Detail_Data.myBankData.bank_acknowledgeText)
}
const verifyDocumentPreviewModal = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.documentPreview).click({
        force: true
    })
}
const clickOModalCloseButton = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.closeButtononModalReviewDocument).click({
        force: true
    })
}
const clickonDownloadIcon = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.downloadIconReviewDocument).click({
        force: true
    })
}
const checkagreementCheckBox = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.agreementCheckBox).check({
        force: true
    })
    pages.generalActions.waitForTime(2000)
}
const verifyNextButtonDisabled = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.nextButtonRviewDocument).should("be.visible")
}
const clickOnNextButtonReviewDocument = () => {
    pages.generalActions.getElementUsingLocator(elements.myBankDetailElement.nextButtonRviewDocument).click({
        force: true
    })
}
const verifygoToMYApplication = () => {
    pages.generalActions.verifyElementsText(elements.myBankDetailElement.pageDescription, data.my_Bank_Detail_Data.myBankData.last_page_description)

}
const selectiObjectAgreement = () => {
    pages.generalActions.selectDropdownValue(elements.myBankDetailElement.iObjectDropdown, data.my_Bank_Detail_Data.myBankData.bank_power_of_attorney)

}
const redirectToApplicationPage = () => {
    pages.generalActions.clickButtonUsingLocator(elements.myBankDetailElement.redirectToApplication)

}

const myBankDetailActions = {
    selectBankLocation,
    bankDetailForm,
    bankDetailSubmitButton,
    clickonPreviewModal,
    clickonModalCloseButton,
    clickonModalDownloadButton,
    clickONextButton,
    verifyTextOnReviewDocumentPage,
    verifyDocumentPreviewModal,
    clickOModalCloseButton,
    clickonDownloadIcon,
    checkagreementCheckBox,
    verifyNextButtonDisabled,
    clickOnNextButtonReviewDocument,
    verifygoToMYApplication,
    selectiObjectAgreement,
    redirectToApplicationPage


}

export default myBankDetailActions