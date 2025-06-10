import React, { FunctionComponent, useState, useEffect, useMemo } from "react";
import {Link, useParams} from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import map from "lodash/map";
import size from "lodash/size";
import first from "lodash/first";
import each from "lodash/each";
import get from "lodash/get";
import keys from "lodash/keys";
import uniq from "lodash/uniq";
import includes from "lodash/includes";
import filter from "lodash/filter";
import Form from "react-bootstrap/Form";
import { IDocument } from "../../interfaces/EligibilityCriteria/criteria";
import CommentsSection from "../BankDetailsForm/Comments";
import FilePreviewModal from "../../components/FilePreviewModal";
import { Params } from "../TaxForms/interfaces";
import { selectKYCRecord } from "../KnowYourCustomer/selectors";
import {
  useGetDocumentsQuery,
  useGetApprovedDocumentsQuery, useGetApplicationStatusQuery,
} from "../../api/rtkQuery/fundsApi";
import { AgreeDocumentBlock } from "../EligibilityCriteria/styles";
import { SubTitle, Checkbox } from "./styles";
import { useGetAgreementsQuery } from "../../api/rtkQuery/agreementsApi";
import { AGREEMENTS, FUND_DOCUMENTS } from "../../constants/commentModules";
import { getUnavailableSectionMesage } from "../../constants/applicationView";
import DocumentRequest from "./Components/DocumentRequest";
import { IApplicationRequestedDocument } from "../KnowYourCustomer/interfaces";
import {selectIsEligible} from "../EligibilityCriteria/selectors";
import CommentWrapper from "../../components/CommentWrapper";
import {IApplicationStatus} from "../../interfaces/application";
import { useCompanyPrefix } from "../../utils/hooks";

interface IFundDocuments {
  callbackFundDocumentStatus?: (isEnabled: boolean) => void;
}

const FundDocuments: FunctionComponent<IFundDocuments> = ({callbackFundDocumentStatus}) => {
  const [docViewed, setDocViewed] = useState<any[]>([]);
  const [acceptedDocs, setAcceptedDocs] = useState<any[]>([]);
  const { externalId } = useParams<Params>();
  const {companyPrefix} =useCompanyPrefix();
  const isEligible = useAppSelector(selectIsEligible);
  const { data: agreements } = useGetAgreementsQuery(externalId);
  const { data: applicationStatus } = useGetApplicationStatusQuery<{ data: IApplicationStatus }>(externalId);
  const isAllocationApproved = applicationStatus?.can_go_past_eligibility;
  const canSeeAgreementDocuments = applicationStatus?.can_view_agreements
  const { commentsByRecord,
    applicationDocumentsRequests,
    applicationRequestedDocuments,
    applicationRecord,
    kycRecordId
   } = useAppSelector(selectKYCRecord);
  const { data: documents } = useGetDocumentsQuery(externalId, {
    skip: !externalId,
  });
  const { data: apiApprovedDocuments } = useGetApprovedDocumentsQuery(
    externalId,
    {
      skip: !externalId,
    }
  );
  const fundDocumentComments = get(commentsByRecord, `${FUND_DOCUMENTS}`)
  const agreementComments = get(commentsByRecord, `${AGREEMENTS}`)

  useEffect(() => {
    const acceptedDocs: number[] = [];
    const availableDocsId = map(documents, "id");
    const apiApprovedDocs = get(first(apiApprovedDocuments), "response_json");
    each(keys(apiApprovedDocs), (val: string) => {
      if (includes(availableDocsId, parseInt(val)) && apiApprovedDocs[val])
        acceptedDocs.push(parseInt(val));
    });
    setAcceptedDocs(acceptedDocs);
    setDocViewed(acceptedDocs);
  }, [apiApprovedDocuments, documents]);



  const callbackPreviewFile = async (document: IDocument) => {
    setDocViewed(uniq([...docViewed, document.id]));
  };

  const isDocViewed = (document: IDocument) => {
    return includes(docViewed, document.id);
  };

  const isDocApproved = (document: IDocument) => {
    return includes(acceptedDocs, document.id);
  };

  const getAgreementDocument = (agreement: { signed_document: any; document: any; }) => {
    if (agreement.signed_document) return agreement.signed_document;
    return agreement.document
  }

  const getRequestDocuments = (request_id: number) => {
    const documents: IApplicationRequestedDocument[] = [];
    applicationRequestedDocuments.forEach((document:any) => {
      if(document.application_document_request === request_id) documents.push(document)
    })
    return documents
  }

  const getAgreementComment = (fieldId: number) => {
    const comments = get(agreementComments, `${fieldId}.${fieldId}`)
    return comments && comments[''];
  }

  const isDocumentSectionEnabled = () => {
    const approvedDocs = filter(documents, (document) => isDocApproved(document));
    const isEnabled = size(approvedDocs) > 0 || applicationRequestedDocuments?.length > 0 || agreements?.length > 0;
    if(callbackFundDocumentStatus)
      callbackFundDocumentStatus(isEnabled);
    return isEnabled
  }
  let nextPath = `${companyPrefix}/investor/funds/${externalId}/review_docs`
  if (applicationStatus?.has_pre_document_stage) {
    nextPath = `${companyPrefix}/investor/funds/${externalId}/agreements`
  }

  return (
    <>
      <SubTitle>Documents</SubTitle>
      {!isDocumentSectionEnabled() || !isAllocationApproved || (applicationStatus?.has_pre_document_stage && !applicationStatus?.can_view_agreements) ? (
        <p>{getUnavailableSectionMesage("Fund Documents")}</p>
      ) : (
        <>
          <div>
            <Link
              to={{
                pathname: nextPath,
              }}
            >
              Go to Documents
            </Link>
          </div>
          <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
            <ul>
              {map(documents, (document) => {
                const documentComments = get(
                  fundDocumentComments,
                  `${document.id}`
                );
                return isDocApproved(document) && <li className={"mt-2"}>
                <AgreeDocumentBlock>
                  <FilePreviewModal
                    documentId={`${document.document_id}`}
                    documentName={document.document_name}
                    callbackPreviewFile={() =>
                      callbackPreviewFile(document)
                    }
                    callbackDownloadFile={() =>
                      callbackPreviewFile(document)
                    }
                  >
                    <Checkbox
                      type="checkbox"
                      label={document.document_name}
                      value={document.id}
                      checked={isDocApproved(document)}
                      disabled={!isDocViewed(document)}
                      id={`approval-${document.doc_id}`}
                    />
                  </FilePreviewModal>
                </AgreeDocumentBlock>
                <CommentsSection
                  comments={documentComments}
                  fieldId={`${document.id}`}
                />
              </li>
              })}
            </ul>
          </div>
          {canSeeAgreementDocuments && <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
            <ul>
              {agreements && map(agreements, (agreement) => {
                const document = getAgreementDocument(agreement);
                return (
                  <li className={"mt-2"}>
                    <AgreeDocumentBlock>
                      <FilePreviewModal
                        documentId={`${document.document_id}`}
                        documentName={document.title}
                        callbackPreviewFile={() =>
                          callbackPreviewFile(document)
                        }
                        callbackDownloadFile={() =>
                          callbackPreviewFile(document)
                        }
                      ></FilePreviewModal>
                    </AgreeDocumentBlock>
                    {map(getAgreementComment(agreement.id), (comment: any, index) => (
                      <CommentWrapper key={index} comment={comment}/>
                    ))}
                  </li>
                );
              })}
            </ul>
          </div>}
          <div>
            <ul>
              {applicationDocumentsRequests && applicationDocumentsRequests.map((request) => (
                <DocumentRequest
                  request={request}
                  documents={getRequestDocuments(request.id)}
                  applicationId={applicationRecord?.id}
                  comments={
                    commentsByRecord &&
                    commentsByRecord[request.id]
                  }
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
};

export default FundDocuments;
