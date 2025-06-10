import React, {FunctionComponent} from 'react';
import {IComment} from "../../interfaces/Workflow/comment";
import {formatDateTime} from "../../utils/dateFormatting";
import {CommentAuthor, CommentAuthorTime, CommentDateTime, CommentText} from "./styles";

interface CommentsProps {
  comment: IComment
}


const CommentItem: FunctionComponent<CommentsProps> = ({comment}) => {

  return <div className={'mb-4'}>
    <CommentAuthorTime className={'mb-2'}>
      <span>
        <CommentAuthor>{comment.created_by_name}</CommentAuthor>
        <CommentDateTime>{formatDateTime(comment.created_at)}</CommentDateTime>
      </span>
    </CommentAuthorTime>
    <CommentText dangerouslySetInnerHTML={{ __html: comment.text }} />
  </div>
};

export default CommentItem;
