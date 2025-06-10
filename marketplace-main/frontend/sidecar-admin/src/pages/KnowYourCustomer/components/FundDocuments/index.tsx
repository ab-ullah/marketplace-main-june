import {FunctionComponent, useEffect, useState} from "react";
import map from "lodash/map";
import find from "lodash/find";
import each from "lodash/each";
import get from "lodash/get";
import keys from "lodash/keys";
import uniq from "lodash/uniq";
import isNil from "lodash/isNil";
import includes from "lodash/includes";
import isEmpty from "lodash/isEmpty";
import Form from "react-bootstrap/Form";
import {KYCRecordResponse} from "../../../../interfaces/workflows";
import {IDocument} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import FilePreviewModal from "../../../../components/FilePreviewModal";
import {useGetApprovedDocumentsQuery, useGetDocumentsByApplicationQuery,} from "../../../../api/rtkQuery/fundsApi";
import {AgreeDocumentBlock} from "../../../EligibilityCriteriaPreview/styles";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectKYCState} from "../../selectors";
import RequestModal from "../RequestModal";
import { QuestionFlag } from "../../styles";
import {FUND_DOCUMENTS} from "../../../../constants/commentModules";
import Agreements from "../FundAgreements";
import DocumentRequest from "../DocumentRequests";
import { approveComment } from "../../thunks";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import { CommentApproveButton } from "../TaxFormDocument/styles";

interface FundDocumentsProps {
  record: KYCRecordResponse;
  applicationId: number;
}

const initFlagModal = { show: false, requestModalText: "", questionId: 0 };

const FundDocuments: FunctionComponent<FundDocumentsProps> = ({ record, applicationId }) => {
  const [docViewed, setDocViewed] = useState<number[]>([]);
  const [acceptedDocs, setAcceptedDocs] = useState<number[]>([]);
  const [flagDetails, setFlagDetails] = useState(initFlagModal);
  const { 
    commentsByRecord,
    fundAgreements,
    applicationDocumentsRequests, 
    applicationDocumentsRequestsResponse,
   } = useAppSelector(selectKYCState);
   const dispatch = useAppDispatch();

  const { data: documents, isLoading: isLoadingDocuments } =
    useGetDocumentsByApplicationQuery(applicationId, {
      skip: !applicationId,
    });
  const { data: apiApprovedDocuments } = useGetApprovedDocumentsQuery(
    applicationId,
    {
      skip: !applicationId,
    }
  );
  
  useEffect(() => {
    const acceptedDocs: number[] = [];
    const availableDocsId = map(documents, "id");
    const apiApprovedDocs = map(
      keys(get(apiApprovedDocuments, "0.response_json")),
      (val: string) => parseInt(val)
    );
    each(apiApprovedDocs, (val) => {
      if (includes(availableDocsId, val)) acceptedDocs.push(val);
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

  const getRequestDocuments = (request_id: number) => {
    const documents: any = [];
    applicationDocumentsRequestsResponse.forEach((document: { application_document_request: number; }) => {
      if(document.application_document_request === request_id) documents.push(document)
    })
    return documents
  }

  const showFlagModal = (questionId: number) => {
    const selectedFile = find(documents, (document) => document.id === questionId);
    if(selectedFile)
      setFlagDetails({
        show: true,
        questionId,
        requestModalText: selectedFile?.document_name,
      });
  };
  
  const hideFlagModal = () => setFlagDetails(initFlagModal);

  const getIsFlagged = (document_id: string) => {
    const commentsOfThisRecord = get(commentsByRecord, `${FUND_DOCUMENTS}.${document_id}.${document_id}`);
    const comment = commentsOfThisRecord && commentsOfThisRecord[''];
    return comment && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status)
  };

  const getCommentId = (document_id: string) => {
    const commentsOfThisRecord = get(commentsByRecord, `${FUND_DOCUMENTS}.${document_id}.${document_id}`);
    const comment = commentsOfThisRecord && commentsOfThisRecord[''];
    return comment?.id;
  };

  const handleApproveComment = (commentId: number) => {
    dispatch(approveComment(commentId))
  }

  if (
    !isLoadingDocuments &&
    (isNil(documents) || isEmpty(documents)) &&
    isEmpty(fundAgreements) &&
    isEmpty(applicationDocumentsRequests)
  )
    return <>There are no fund documents to show.</>;
  return (
    <>
      <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
        <ul>
          {map(documents, (document) => (
            <li className={"mt-2"} key={document.document_id}>
              <AgreeDocumentBlock>
                <FilePreviewModal
                  documentId={`${document.document_id}`}
                  documentName={document.document_name}
                  callbackPreviewFile={() => callbackPreviewFile(document)}
                  callbackDownloadFile={() => callbackPreviewFile(document)}
                >
                  <Form.Check
                    type="checkbox"
                    label={document.document_name}
                    value={document.id}
                    checked={isDocApproved(document)}
                    disabled={!isDocViewed(document)}
                    id={`approval-${document.doc_id}`}
                  />
                </FilePreviewModal>
                <QuestionFlag
                  className="question-flag"
                  flagged={getIsFlagged(document.id)}
                  onClick={() => showFlagModal(document.id)}
                />
                {getIsFlagged(document.id) && (
                  <CommentApproveButton 
                    onClick={() => handleApproveComment(getCommentId(document.id))}
                  >
                    Approve
                  </CommentApproveButton>
                )}
              </AgreeDocumentBlock>
            </li>
          ))}
        </ul>
        <ul>
          <Agreements
            agreements={fundAgreements}
            record={record}
            applicationId={applicationId}
            onApproveComment={handleApproveComment}
          />
        </ul>
        <ul>
          {applicationDocumentsRequests.length > 0 &&
            applicationDocumentsRequests?.map((request: any) => (
              <DocumentRequest
                request={request}
                documents={getRequestDocuments(request.id)}
                applicationId={applicationId}
                record={record}
                onApproveComment={handleApproveComment}
              />
            ))}
        </ul>
      </div>
      {flagDetails && flagDetails.questionId ? (
        <RequestModal
          key={flagDetails.questionId}
          show={flagDetails.show}
          onHide={hideFlagModal}
          fieldValue={flagDetails.requestModalText}
          applicationId={applicationId}
          module={FUND_DOCUMENTS}
          moduleId={flagDetails.questionId}
          commentFor={record.user.id}
          questionIdentifier={`${flagDetails.questionId}`}
          commentLabel={flagDetails.requestModalText}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default FundDocuments;
