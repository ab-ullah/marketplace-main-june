const createButton = 'div[id=fund-setup-tab-tabpane-eligibilityCriteria] button[type=button]'
const filterSearchInput = 'input[placeholder=Filter]'
const tableContainerDiv = '.table-container'
const eligibilityCountryPopupInput = '.sc-aiooD > :nth-child(1) > .basic-single > .select__control > .select__value-container > .select__placeholder'
//'.sc-eSoXWK > :nth-child(1) > .basic-single > .select__control > .select__value-container'
const nextButton = 'button[type=submit].create'
const cancelButton = 'button[type=button].cancel'
const actionsDotsButton = 'div[aria-colindex="5"] div>svg'
const muiPopoverDiv = 'div.MuiPopover-paper'
const actionsPopupEditLink = 'a.disabled:nth-child(1)'
const actionsPopupDeleteLink = 'a.disabled:nth-child(2)'
const eligibilityRowInTable = '.rs-table-body-row-wrapper  div[role=row]'

const eligibilityCriteriaElements = {
    createButton,
    filterSearchInput,
    tableContainerDiv,
    eligibilityCountryPopupInput,
    nextButton,
    cancelButton,
    actionsDotsButton,
    muiPopoverDiv,
    actionsPopupEditLink,
    actionsPopupDeleteLink,
    eligibilityRowInTable
}

module.exports = eligibilityCriteriaElements