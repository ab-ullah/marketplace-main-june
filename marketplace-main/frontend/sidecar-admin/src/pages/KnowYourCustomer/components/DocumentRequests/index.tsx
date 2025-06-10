import React, {FunctionComponent, useState} from "react";
import FilePreviewModal from '../FilePreview';
import {CommentApproveButton, QuestionContainer} from "../TaxFormDocument/styles";
import {CommentBadge, FileAlreadyAdded, QuestionFlag, QuestionLabel, RequestContent} from '../../styles'
import RequestModal from "../RequestModal";
import {KYCRecordResponse} from "../../../../interfaces/workflows";
import {useAppSelector} from "../../../../app/hooks";
import {selectKYCState} from "../../selectors";
import {DOCUMENTS_REQUEST} from "../../../../constants/commentModules";
import get from "lodash/get";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import Replies from "../Replies";

interface IDocumentRequestProps {
  request: {
    id: number;
    document_name: string;
    document_description: string;
  };
  documents: any;
  applicationId: number;
  record: KYCRecordResponse;
  onApproveComment: (commentId: number) => void;
}

const DocumentRequest: FunctionComponent<IDocumentRequestProps> = ({
  request,
  documents,
  applicationId,
  record,
  onApproveComment,
}) => {
  const { id, document_name } = request;
  const { commentsByRecord } = useAppSelector(selectKYCState);
  const [showModal, setShowModal] = useState(false);

  const hideModal = () => setShowModal(false);
  const flagQuestion = () => setShowModal(true);

  const commentsOfThisRecord = get(commentsByRecord, `${DOCUMENTS_REQUEST}.${id}.${id}`);

  const isFlagged = (id: string) => {
    const comment = commentsOfThisRecord && commentsOfThisRecord[id];
    return comment && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status);
  }

  const getComment = (document_id: string) => {
    const comment = get(commentsOfThisRecord, document_id);
    return comment
  };
  
  return (
    <QuestionContainer>
      <RequestContent>
        <QuestionLabel>
          {document_name}
        </QuestionLabel>
      </RequestContent>
      <RequestContent>
      {
         documents.length > 0 ? documents.map((document: { document: { title: string; document_id: string; }; id: string; }) => 
         <div>
          <RequestModal
            show={showModal}
            onHide={hideModal}
            fieldValue={document_name}
            applicationId={applicationId}
            module={DOCUMENTS_REQUEST}
            moduleId={id}
            commentFor={record.user.id}
            questionIdentifier={`${id}`}
            documentIdentifier={document.document.document_id}
            commentLabel={`${document_name}: ${document.document.title}`}
          />
          <FileAlreadyAdded>
            <FilePreviewModal
            title={document.document.title}
            questionId={document.id}
            documentName={document.document.title}
            documentId={document.document.document_id}
            recordId={applicationId}
          />
          <QuestionFlag flagged={isFlagged(document.document.document_id)} onClick={flagQuestion} />
          {isFlagged(document.document.document_id) && (
                <CommentApproveButton
                  onClick={() =>
                    onApproveComment(
                      getComment(document.document.document_id)?.id
                    )
                  }
                >
                  Approve
                </CommentApproveButton>
              )}
         </FileAlreadyAdded>
         <Replies comment={getComment(document.document.document_id)}/>
         </div>
            ) : (
              <CommentBadge>Pending</CommentBadge>
            )
      }
      </RequestContent>
    </QuestionContainer>
  );
};

export default DocumentRequest;
