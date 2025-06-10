import React, { FunctionComponent } from 'react';
import { Comment } from '../../interfaces/workflows';
import { CommentContainer, CommentBadge, ReplyButton, RepliesWrapper, Reply } from "./styles";
import { COMMENT_RESOLVED } from "../../constants/commentStatus";
import { COMMENT_STATUSES } from './constants';
import { setIsReplyModalOpen } from '../../pages/KnowYourCustomer/kycSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { get } from 'lodash';
import { formatDateTime } from '../../pages/KnowYourCustomer/utils';

interface CommentProps {
  comment: Comment | null;
}


const CommentWrapper: FunctionComponent<CommentProps> = ({ comment }) => {
  const dispatch = useAppDispatch();
  const replies = get(comment, 'replies', []);
  if (comment && comment.status === COMMENT_RESOLVED) return null;
  const status = comment && COMMENT_STATUSES[comment.status];
  

  return (
    <CommentContainer status={status} className="comment-wrapper">
      <CommentBadge status={status}>
        {status && status.label}
      </CommentBadge>
      <div>{comment && comment.text}</div>
      <RepliesWrapper>
      {
            replies.map((reply: any) => <Reply>
            <div>
            <h5>{reply.is_admin_user ? 'Admin': `${get(reply,'reply_by.first_name')} ${get(reply,'reply_by.last_name')}`}</h5>
            <p>{formatDateTime(get(reply, 'created_at', ''))}</p>
            </div>
            <p>{get(reply, 'text')}</p>
            </Reply>)
        }
          <ReplyButton onClick={() => dispatch(setIsReplyModalOpen({show: true, comment}))}>Reply</ReplyButton>
      </RepliesWrapper>
    </CommentContainer>
  );
}

export default CommentWrapper;