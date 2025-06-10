import {FunctionComponent, useState} from "react";
import FilePreview from "../FilePreview";
import {CommentApproveButton, QuestionContainer, QuestionFlag, TaxDocumentLabelContainer, TaxDocumentName} from "./styles";
import {selectKYCState} from '../../selectors';
import RequestModal from '../RequestModal';
import {useAppDispatch, useAppSelector} from '../../../../app/hooks';
import {TAX_RECORD} from "../../../../constants/commentModules";
import get from "lodash/get";
import { approveComment } from "../../thunks";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import { QuestionLabel } from "../../styles";
import Replies from "../Replies";
import styled from "styled-components";


interface Props {
    doc: any,
    recordId: number,
    applicationId: number,
    userId: number,
}

const TaxForm: FunctionComponent<Props> = ({ doc, recordId, applicationId, userId }) => {
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const { commentsByRecord } = useAppSelector(selectKYCState);

    const formWithVersion = `${doc.form.form_id}-${doc.form.version}`;
    const commentsOfThisRecord = get(commentsByRecord, `${TAX_RECORD}.${doc.record_id}`);
    const taxFormComments = commentsOfThisRecord && commentsOfThisRecord[formWithVersion]
    const comment = taxFormComments && taxFormComments[""]
    const flagged = comment && [COMMENT_CREATED, COMMENT_UPDATED].includes(comment.status);

    const flagQuestion = () => setShowModal(true);
    const hideModal = () => setShowModal(false);

    const handleApproveComment = () => {
        dispatch(approveComment(comment.id))
      }

    return (
      <>
        <RequestModal
          show={showModal}
          onHide={hideModal}
          fieldValue={doc.field_id}
          applicationId={applicationId}
          module={TAX_RECORD}
          moduleId={doc.record_id}
          commentFor={userId}
          questionIdentifier={formWithVersion}
          commentLabel={doc.form.form_id}
        />
        <TaxDocumentLabelContainer>
          <TaxDocumentName className="label">
          <QuestionLabel>
            <span>{doc.form.form_id}</span>
          </QuestionLabel>
          <QuestionFlag flagged={flagged} onClick={flagQuestion} />
        {flagged && (
          <CommentApproveButton onClick={handleApproveComment}>
            Approve
          </CommentApproveButton>
        )}
          </TaxDocumentName>
        <Replies comment={comment} />
        </TaxDocumentLabelContainer>
      </>
    );
};

export default TaxForm;
