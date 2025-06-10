import { FunctionComponent, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import map from "lodash/map";
import find from "lodash/find";
import get from "lodash/get";
import { AgreeDocumentBlock } from "../../../EligibilityCriteriaPreview/styles";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectKYCState } from "../../selectors";
import RequestModal from "../RequestModal";
import {
  CommentBadge,
  FakeLink,
  FlagAndBadgeWrapper,
  QuestionContainer,
  QuestionFlag,
  QuestionLabel,
  ReplySectionWrapper,
  RequestContent,
} from "../../styles";
import { AGREEMENTS } from "../../../../constants/commentModules";
import API from '../../../../api/backendApi';
import { CommentApproveButton } from "../TaxFormDocument/styles";
import { isNil } from "lodash";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import FilePreviewModal from "../../../../components/FilePreviewModal";
import { Button } from "react-bootstrap";
import { setIsApproveButtonDisabled } from "../../kycSlice";
import { fetchFundAgreements } from "../../thunks";
import { fetchTaskDetail } from "../../../TaskReview/thunks";
import Replies from "../Replies";

interface AgreementDocumentsProps {
  agreements: [];
  record: any;
  applicationId: number;
  onApproveComment: (commentId: number) => void;
}

const initFlagModal = { show: false, requestModalText: "", questionId: 0 };

const Agreements: FunctionComponent<AgreementDocumentsProps> = ({
  agreements,
  record,
  applicationId,
  onApproveComment
}) => {
  const [flagDetails, setFlagDetails] = useState(initFlagModal);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const { commentsByRecord } = useAppSelector(selectKYCState);
  const commentsOfThisRecord = get(commentsByRecord, `${AGREEMENTS}`);
  const {taskId, externalId, recordId} = useParams<{taskId: string, externalId: string, recordId: string}>();
  const dispatch = useAppDispatch();
  const isAgreementSigned = (agreement: any) => {
    return agreement.completed;
  };

  const hideFlagModal = () => setFlagDetails(initFlagModal);

  const showFlagModal = (agreement_id: number) => {
    const selectedAgreement = find(
      agreements,
      (agreement: any) => agreement.id === agreement_id
    );
    if (selectedAgreement)
      setFlagDetails({
        show: true,
        questionId: selectedAgreement.id,
        requestModalText: selectedAgreement?.document.title,
      });
  };

  const isGpSignatureRequired = (agreement: any) => {
    if(!get(agreement, 'gp_signing_complete') && get(agreement, 'is_gp_signer')) return true
    return false
  }

  const getIsFlagged = (document_id: number) => {
    const comments = get(commentsOfThisRecord, `${document_id}.${document_id}`);
    const comment = comments && comments[''];
    return !isNil(comment) && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status)
  };

  const getComment = (document_id: number) => {
    const comments = get(commentsOfThisRecord, `${document_id}.${document_id}`);
    const comment = comments && comments[''];
    return comment;
  };

  const storeUserResponse = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    const envelopeId = urlParams.get("envelope_id");
    if (envelopeId && event === "signing_complete") {
      dispatch(setIsApproveButtonDisabled(true));
      await API.storeUserResponse(envelopeId);
      dispatch(fetchFundAgreements(applicationId.toString()));
      taskId && dispatch(fetchTaskDetail(taskId));
      dispatch(setIsApproveButtonDisabled(false));
    }
  }

  useEffect(() => {
    storeUserResponse()
  }, [])

  const signingUrl = async (envelope_id: string) => {
    const { host, protocol } = window.location
    let return_url = null;
    if (taskId) {
      return_url = encodeURIComponent(
        `${protocol}//${host}/admin/tasks/${taskId}/review?envelope_id=${envelope_id}`
      );
    }
    else {
      return_url = encodeURIComponent(
        `${protocol}//${host}/admin/funds/${externalId}/applicants/${applicationId}?envelope_id=${envelope_id}`
      );
    }
    setIsFetchingUrl(true);
    const response = await API.getAgreementsSigningUrl(envelope_id, return_url);
    setIsFetchingUrl(false);
    window.open(response.signing_url, "_blank");
    return response;
  };

  const getDocument = (agreement: {
    completed: any;
    signed_document: any;
    document: any;
  }) => {
    if (agreement.completed) return agreement.signed_document;
    return agreement.document;
  };

  return (
    <>
      {agreements &&
        map(agreements, (agreement: any) => (
          <>
            <QuestionContainer>
            <RequestContent>
              <QuestionLabel>
                <AgreeDocumentBlock>
                  <FilePreviewModal 
                    documentId={getDocument(agreement).document_id}
                    documentName={getDocument(agreement).title}
                  />
                  {isGpSignatureRequired(agreement) && 
                  <Button 
                  variant="primary"
                  onClick={() => {
                    if (!isFetchingUrl) signingUrl(agreement.envelope_id);
                  }}
                  >
                    GP Sign
                  </Button>}
                </AgreeDocumentBlock>
              </QuestionLabel>
            </RequestContent>
            <FlagAndBadgeWrapper>
              {isAgreementSigned(agreement) ? (
                <CommentBadge color="#0f7878">Signed</CommentBadge>
              ) : (
                <CommentBadge>Pending</CommentBadge>
              )}

              <QuestionFlag
                flagged={getIsFlagged(agreement.id)}
                onClick={() => showFlagModal(agreement.id)}
              />
              {getIsFlagged(agreement.id) && (
                <CommentApproveButton
                  onClick={() =>
                    onApproveComment(
                      getComment(agreement.id)?.id
                    )
                  }
                >
                  Approve
                </CommentApproveButton>
              )}
            </FlagAndBadgeWrapper>
            <RequestModal
              show={flagDetails?.show}
              onHide={hideFlagModal}
              fieldValue={flagDetails.requestModalText}
              module={AGREEMENTS}
              moduleId={flagDetails?.questionId}
              applicationId={applicationId}
              questionIdentifier={`${flagDetails.questionId}`}
              commentFor={record.user.id}
              commentLabel={flagDetails.requestModalText} />
          </QuestionContainer>
          <ReplySectionWrapper>
            <Replies comment={getComment(agreement.id)}/>
          </ReplySectionWrapper>
          </>
        ))}
    </>
  );
};

export default Agreements;
