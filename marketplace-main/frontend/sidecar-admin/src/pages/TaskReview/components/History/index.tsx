import React, {FunctionComponent, useEffect} from "react";
import {
    CommentAuthor,
    CommentContainer,
    CommentDateTime,
    CommentHeading,
} from "../../../../components/Comments/styles";
import {formatDateTime} from "../../../../utils/dateFormatting";



const TaskHistory: (approver: string, approvalDate: string) => (JSX.Element) = (approver: string, approvalDate: string) => {
    return <CommentContainer className="white-bg">
        <CommentHeading>Approver</CommentHeading>
        <span>
            <CommentAuthor>{approver}</CommentAuthor>
            <CommentDateTime>{formatDateTime(approvalDate)}</CommentDateTime>
        </span>
    </CommentContainer>
};

export default TaskHistory;