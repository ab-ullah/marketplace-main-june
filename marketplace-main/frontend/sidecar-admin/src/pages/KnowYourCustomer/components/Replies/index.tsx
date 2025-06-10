import { get } from "lodash";
import React, { FunctionComponent, useMemo, useState } from "react";
import API from '../../../../api/backendApi'
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { COMMENT_CREATED, COMMENT_RESOLVED, COMMENT_UPDATED } from "../../../../constants/commentStatus";
import { formatDateTime } from "../../../../utils/dateFormatting";
import { selectApplicationInfo, selectKYCState } from "../../selectors";
import { RepliesContainer, RepliesWrapper, ReplyButton, ReplyField, TextAreaWrapper } from "../../styles";
import { fetchCommentsByApplicationId, fetchCommentsByKycRecordId } from "../../thunks";

interface IReplies {
    comment: any;
    isApplicationView?: boolean;
}

const Replies: FunctionComponent<IReplies> = ({comment, isApplicationView}) => {
    const dispatch = useAppDispatch()
    const applicationInfo = useAppSelector(selectApplicationInfo)
    const { comments } = useAppSelector(selectKYCState)
    const [reply, setReply] = useState('')
    const replies = get(comment, 'replies', [])
    
    const onSendReply = async () => {
        await API.createReply(comment.id, {
            text: reply
        })
        setReply("")
        if(applicationInfo){
            dispatch(fetchCommentsByApplicationId(applicationInfo.id))
            dispatch(fetchCommentsByKycRecordId(applicationInfo.kyc_record))
        }

    }

    const fieldComments = useMemo(() => {
        if(comment){
            return comments.filter((fieldComment) => fieldComment.question_identifier === comment.question_identifier)
        }
        else {
            return []
        }
    }, [comments, comment])


    if(!comment || replies.length === 0)  return null

    if(comment.status === COMMENT_RESOLVED && isApplicationView) return null

    return <RepliesContainer>
        {
            isApplicationView && comment.question_identifier && fieldComments.map((fieldComment) => <RepliesWrapper>
            <div>
            <h5>Comment</h5>
            <p>{formatDateTime(fieldComment.created_at)}</p>
            </div>
            <p>{get(fieldComment, 'text', '')}</p>
        </RepliesWrapper>)
        }
        {
          replies.map((reply: any) => <RepliesWrapper>
            <div>
            <h5>{reply.is_admin_user ? 'Admin': `${get(reply,'reply_by.first_name')} ${get(reply,'reply_by.last_name')}`}</h5>
            <p>{formatDateTime(reply.created_at)}</p>
            </div>
            <p>{get(reply, 'text')}</p>
            </RepliesWrapper>)
        }
        {
            comment.status !== COMMENT_RESOLVED && <TextAreaWrapper>
            <ReplyField as="textarea" name="reply" placeholder="Reply" value={reply} onChange={(e: any) => setReply(e.target.value)}/>
            <ReplyButton onClick={onSendReply}>Reply</ReplyButton>
        </TextAreaWrapper>
        }
    </RepliesContainer>
}

Replies.defaultProps = {
    isApplicationView: true
}


export default Replies;