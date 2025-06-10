import {FunctionComponent, useEffect, useState} from "react";
import map from "lodash/map";
import DOMPurify from 'dompurify';
import {useParams} from "react-router-dom";
import get from "lodash/get";
import isNil from "lodash/isNil";
import isEmpty from "lodash/isEmpty";
import {KYCRecordResponse} from "../../../../interfaces/workflows";
import FilePreviewModal from "../../../../components/FilePreviewModal";
import {useFetchProgramDocsQuery} from "../../../../api/rtkQuery/fundsApi";
import {AgreeDocumentBlock} from "../../../EligibilityCriteriaPreview/styles";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectApplicationInfo, selectKYCState} from "../../selectors";
import RequestModal from "../RequestModal";
import {FakeLink, QuestionFlag} from "../../styles";
import {PROGRAM_DOCS} from "../../../../constants/commentModules";
import {IPowerOfAttorney} from "../../../../interfaces/application";
import API from "../../../../api/backendApi";
import {Status} from "./styles";
import NavableLoader from "../../../../components/NavableLoader";
import { CommentApproveButton } from "../TaxFormDocument/styles";
import { approveComment } from "../../thunks";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import Replies from "../Replies";

interface ProgramDocsProps {
  record: KYCRecordResponse;
  applicationId: number;
  documents: IPowerOfAttorney;
}

const initFlagModal = {
  show: false,
  requestModalText: "",
  moduleId: 0,
  questionIdentifier: "",
  documentIdentifier: undefined
};

const ProgramDocs: FunctionComponent<ProgramDocsProps> = ({record, applicationId, documents}) => {
  const dispatch = useAppDispatch();
  const [flagDetails, setFlagDetails] = useState(initFlagModal);
  const [isApiLoading, setIsApiLoading] = useState(false)
  const {commentsByRecord} = useAppSelector(selectKYCState);
  const applicationInfo = useAppSelector(selectApplicationInfo);
  const {data: programDocuments, isLoading} = useFetchProgramDocsQuery(applicationId, {
    skip: !applicationId,
  });

  useEffect(() => {
    storeUserResponse()
  }, [])

  if (!applicationInfo) return <></>

  const externalId = applicationInfo.fund_external_id;
  const showFlagModal = (title: string, programId: number, companyDocId: string, signedDocId?: string) => {
    let details: any = {
      show: true,
      moduleId: programId,
      requestModalText: title,
      questionIdentifier: companyDocId,
    };
    if (signedDocId)
      details.documentIdentifier = signedDocId;
    setFlagDetails(details);
  };

  const hideFlagModal = () => setFlagDetails(initFlagModal);


  const getIsFlagged = (document_id: number, companyDocId: number) => {
    const commentsOfThisRecord = get(commentsByRecord, `${PROGRAM_DOCS}.${document_id}.${companyDocId}`);
    const comment = commentsOfThisRecord && commentsOfThisRecord['']
    return !isNil(comment) && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status);
  };

  const getIsSignedFlagged = (document_id: number, docId: number, signedId: string) => {
    const commentsOfThisRecord = get(commentsByRecord, `${PROGRAM_DOCS}.${document_id}.${docId}.${signedId}`);
    return !isNil(commentsOfThisRecord) && [COMMENT_CREATED, COMMENT_UPDATED].includes(commentsOfThisRecord.status);
  };

  const getSignedDocComment = (document_id: number, docId: number, signedId: string) => {
    return get(commentsByRecord, `${PROGRAM_DOCS}.${document_id}.${docId}.${signedId}`, undefined)
  };

  const getDocumentComment = (document_id: number, companyDocId: number) => {
    const commentsOfThisRecord = get(commentsByRecord, `${PROGRAM_DOCS}.${document_id}.${companyDocId}`);
    const comment = commentsOfThisRecord && commentsOfThisRecord['']
    return comment;
  };

  const storeUserResponse = async () => {
    setIsApiLoading(true);
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const event = urlParams.get("event");
    const envelopeId = urlParams.get("envelope_id");
    if (envelopeId && event === "signing_complete") {
      try {
        await API.storeCompanyDocumentUserResponse(externalId, envelopeId);
      }
      catch(error) {
        console.log("tried to update the envelope for a different kind of doc")
      }
    }
    setIsApiLoading(false);
  }


  const signingUrl = async (e: any, envelope_id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const return_url = encodeURIComponent(`${window.location.href.split('?')[0]}?envelope_id=${envelope_id}`);
    setIsApiLoading(true);
    const response = await API.getCompanyDocumentSigningUrl(externalId, envelope_id, return_url);
    window.open(response.signing_url, "_self");
    setIsApiLoading(false);
    return response;
  };

  const handleApproveComment = (id: number) => {
    dispatch(approveComment(id))
  }

  
  if (isNil(programDocuments) || isEmpty(programDocuments))
    return <>Program Documents have not uploaded yet.</>;

  if (isApiLoading || isLoading) return <NavableLoader/>
  console.log("prog doc ", programDocuments)
  return (
    <>
      <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
        <ul>
          {map(
            programDocuments,
            ({
              company_document,
              envelope_id,
              gp_signing_complete,
              is_acknowledged,
              completed,
              signed_document,
              id,
            }) => (
              <li className={"mt-2"} key={id}>
                {(signed_document !== null || completed || is_acknowledged) && (
                  <>
                    <h5 className={"mt-3 mb-2"}>{company_document.name}</h5>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(company_document.description)}} />
                  </>
                )}
                {company_document.require_signature &&
                  company_document.require_wet_signature &&
                  signed_document !== null && (
                    <>
                      <AgreeDocumentBlock>
                        <FilePreviewModal
                          documentId={signed_document?.document_id}
                          documentName={signed_document?.title}
                        >
                          {signed_document?.title}
                        </FilePreviewModal>
                        <QuestionFlag
                          className="question-flag"
                          flagged={getIsSignedFlagged(
                            id,
                            company_document?.id,
                            signed_document?.document_id
                          )}
                          onClick={() =>
                            showFlagModal(
                              company_document?.document.title,
                              id,
                              company_document?.id,
                              signed_document?.document_id
                            )
                          }
                        />
                        {getIsSignedFlagged(
                          id,
                          company_document?.id,
                          signed_document?.document_id
                        ) && (
                          <CommentApproveButton
                            onClick={() =>
                              handleApproveComment(
                                getSignedDocComment(
                                  id,
                                  company_document?.id,
                                  signed_document?.document_id
                                )?.id
                              )
                            }
                          >
                            Approve
                          </CommentApproveButton>
                        )}
                      </AgreeDocumentBlock>
                      <Replies comment={getSignedDocComment(id, company_document?.id, signed_document?.document_id)} />
                    </>
                  )}
                {company_document.require_signature &&
                  !company_document.require_wet_signature &&
                  completed && (
                   <>
                    <AgreeDocumentBlock>
                      <FilePreviewModal
                        documentId={signed_document?.document_id}
                        documentName={signed_document?.title}
                      >
                        {company_document.gp_signer && !gp_signing_complete ? (
                          <FakeLink
                            onClick={(e: any) => {
                              if (!isApiLoading) signingUrl(e, envelope_id);
                            }}
                            disableLink={isApiLoading}
                          >
                            {company_document?.document.title}
                          </FakeLink>
                        ) : (
                          company_document?.document.title
                        )}
                      </FilePreviewModal>
                      <Status>
                        {company_document.gp_signer && !gp_signing_complete
                          ? "pending gp signature"
                          : "Completed"}
                      </Status>
                      <QuestionFlag
                        className="question-flag"
                        flagged={getIsFlagged(id, company_document.id)}
                        onClick={() =>
                          showFlagModal(
                            company_document?.document.title,
                            id,
                            company_document?.id
                          )
                        }
                      />
                      {getIsFlagged(id, company_document.id) && (
                        <CommentApproveButton
                          onClick={() =>
                            handleApproveComment(
                              getDocumentComment(id, company_document.id)?.id
                            )
                          }
                        >
                          Approve
                        </CommentApproveButton>
                      )}
                    </AgreeDocumentBlock>
                    <Replies comment={getDocumentComment(id, company_document.id)} />
                   </>
                  )}
                {!company_document.require_signature &&
                  !company_document.require_wet_signature &&
                  is_acknowledged && (
                    <>
                    <AgreeDocumentBlock>
                      <FilePreviewModal
                        documentId={company_document?.document.document_id}
                        documentName={company_document?.document.title}
                      >
                        {company_document?.document.title}
                      </FilePreviewModal>
                      <QuestionFlag
                        className="question-flag"
                        flagged={getIsFlagged(id, company_document.id)}
                        onClick={() =>
                          showFlagModal(
                            company_document?.document.title,
                            id,
                            company_document?.id
                          )
                        }
                      />
                      {getIsFlagged(id, company_document.id) && (
                        <CommentApproveButton
                          onClick={() =>
                            handleApproveComment(
                              getDocumentComment(id, company_document.id)?.id
                            )
                          }
                        >
                          Approve
                        </CommentApproveButton>
                      )}
                    </AgreeDocumentBlock>
                    <Replies comment={getDocumentComment(id, company_document.id)} />
                    </>
                  )}
              </li>
            )
          )}
        </ul>
      </div>
      {flagDetails && flagDetails.moduleId ? (
        <RequestModal
          key={flagDetails.moduleId}
          show={flagDetails.show}
          onHide={hideFlagModal}
          fieldValue={flagDetails.requestModalText}
          applicationId={applicationId}
          module={PROGRAM_DOCS}
          moduleId={flagDetails.moduleId}
          commentFor={record.user.id}
          questionIdentifier={flagDetails.questionIdentifier}
          documentIdentifier={flagDetails.documentIdentifier}
          commentLabel={flagDetails.requestModalText}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default ProgramDocs;
