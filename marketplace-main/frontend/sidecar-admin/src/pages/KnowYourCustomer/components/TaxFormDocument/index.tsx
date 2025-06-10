import {FunctionComponent, useState} from "react";
import FilePreview from "../FilePreview";
import {CommentApproveButton, QuestionContainer, QuestionFlag} from "./styles";
import {selectKYCState} from '../../selectors';
import RequestModal from '../RequestModal';
import {useAppDispatch, useAppSelector} from '../../../../app/hooks';
import {TAX_RECORD} from "../../../../constants/commentModules";
import get from "lodash/get";
import { approveComment } from "../../thunks";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import Replies from "../Replies";


interface Props {
    doc: any,
    recordId: number,
    applicationId: number,
    userId: number,
}

const TaxFormDocument: FunctionComponent<Props> = ({ doc, recordId, applicationId, userId }) => {
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const { commentsByRecord } = useAppSelector(selectKYCState);

    const formWithVersion = `${doc.form.form_id}-${doc.form.version}`;
    const commentsOfThisRecord = get(commentsByRecord, `${TAX_RECORD}.${doc.record_id}`);
    const taxFormComments = commentsOfThisRecord && commentsOfThisRecord[doc.document.document_id]
    const comment = taxFormComments && taxFormComments[doc.document.document_id]
    const flagged = comment && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status);

    const flagQuestion = () => setShowModal(true);
    const hideModal = () => setShowModal(false);

    const handleApproveComment = () => {
        dispatch(approveComment(comment.id))
      }

    return (
        <div>
        <QuestionContainer>
            <RequestModal
                show={showModal}
                onHide={hideModal}
                fieldValue={doc.field_id}
                applicationId={applicationId}
                module={TAX_RECORD}
                moduleId={doc.record_id}
                commentFor={userId}
                questionIdentifier={doc.document.document_id}
                documentIdentifier={doc.document.document_id}
                commentLabel={doc.form.form_id}
            />
            <FilePreview
                documentName={doc.document.title}
                title={doc.form.form_id}
                recordId={doc.record_id}
                questionId={`${doc.form.form_id}-${doc.form.version}`}
                documentId={doc.document.document_id}
                FlagComponent={<QuestionFlag flagged={flagged} onClick={() => alert()} />}
                isDownloadAllowed
            />
            <QuestionFlag flagged={flagged} onClick={flagQuestion} />
            {flagged && <CommentApproveButton onClick={handleApproveComment}>Approve</CommentApproveButton>}
        </QuestionContainer>
        <Replies comment={comment} />
        </div>
    );
};

export default TaxFormDocument;
