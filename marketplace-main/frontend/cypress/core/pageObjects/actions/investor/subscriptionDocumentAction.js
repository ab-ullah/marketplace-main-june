import * as elements from '../../elements'
import * as labels from '../../labels'
import * as pages from '../../pages'
import * as data from '../../../../fixtures/data'


const verifySubscriptionDocument = () => {
    pages.generalActions.verifyHyperLinkUsingLocator(elements.subscriptionDocumentElement.backToApplicationLink)

    pages.generalActions.verifyElementOnPage(elements.subscriptionDocumentElement.fundTitle)

    pages.generalActions.verifyFieldValue(elements.subscriptionDocumentElement.pageHeadingSubsDoc,
        data.subscriptionDocumentData.subsDocuments.subs_doc_page_heading)

    pages.generalActions.verifyFieldValue(elements.subscriptionDocumentElement.tableDocumentNameColumn,
        data.subscriptionDocumentData.subsDocuments.subs_doc_doc_name)

    pages.generalActions.verifyFieldValue(elements.subscriptionDocumentElement.tableStatusColumn,
        data.subscriptionDocumentData.subsDocuments.subs_doc_staus_label)

    pages.generalActions.verifyElementOnPage(elements.subscriptionDocumentElement.documentDiv)

    pages.generalActions.verifyFieldValue(elements.subscriptionDocumentElement.pendingYourSignature,
        data.subscriptionDocumentData.subsDocuments.subs_doc_pending_status)

}


const subcriptionDocumentActions = {
    verifySubscriptionDocument,


}

export default subcriptionDocumentActions