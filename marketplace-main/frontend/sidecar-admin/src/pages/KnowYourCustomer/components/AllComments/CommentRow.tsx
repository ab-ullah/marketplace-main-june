import React, {FunctionComponent, useMemo} from 'react';
import API from "../../../../api";
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
// import { fetchComments } from "../../thunks";
import { Comment } from "../../../../interfaces/workflows";
import {
  COMMENT_CREATED,
  COMMENT_RESOLVED,
  COMMENT_UPDATED
} from "../../../../constants/commentStatus";
import {QuestionFlag} from "../../styles";
import {getMonthYear} from "../../../../utils/dateFormatting";
import { Badge, CommentSection, CommentHeader, Resolve } from "./styles";
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import {selectKYCState} from "../../selectors";
import { fetchCommentsByApplicationId, fetchCommentsByKycRecordId } from '../../thunks';
import Replies from '../Replies';

interface CommentRowProps {
  comment: Comment;
}

const CommentRow: FunctionComponent<CommentRowProps> = (
  {
    comment,
  }
) => {
  const {comments, applicationInfo} = useAppSelector(selectKYCState);
  const dispatch = useAppDispatch();
  const markAsResolved = async () => {
    await API.updateKYCCommentStatus(comment.id, COMMENT_RESOLVED);
    dispatch(fetchCommentsByKycRecordId(applicationInfo?.kyc_record as unknown as number));
    if(applicationInfo?.id) dispatch(fetchCommentsByApplicationId(applicationInfo?.id))
  }

  const commentTitle = useMemo(() => {
    if(comment.document_identifier && comment.question_text.includes('view-only')){
      return 'Supporting Documentation'
    }
    return comment.comment_label || comment.question_text
  }, [comment])

  return <CommentSection>
    <CommentHeader>
      <div className={'date-status mb-2'}>
        <Badge status={comment.status}>
          {comment.status === COMMENT_RESOLVED && "Approved"}
          {comment.status === COMMENT_CREATED && "New"}
          {comment.status === COMMENT_UPDATED && "Updated"}
        </Badge>
        <div className={'date-div ms-2'}>{getMonthYear(comment.created_at)}</div>
      </div>
      {comment.status !== COMMENT_RESOLVED && <Resolve onClick={markAsResolved}> <DeleteIcon />Delete</Resolve>}
    </CommentHeader>
    <div className={'flag-question-text mb-2'}>
      <QuestionFlag flagged={false} className={'ms-0 me-2'} />
      <div className={'question-text'}><b>{commentTitle}</b></div>
    </div>
    <div className={'comment'}>
      {comment.text}
    </div>
    <Replies comment={comment} isApplicationView={false}/>
  </CommentSection>
}

export default CommentRow;