import React, {FunctionComponent, useEffect, useState, useMemo} from 'react';
import map from "lodash/map";
import useWebSocket from "react-use-websocket";
import {useAuth0} from "@auth0/auth0-react";
import { getWorkFlowCommentsUrl } from "../../api/workflowAPI/routes";
import CommentItem from "./CommentItem";
import CreateComment from "./CreateComment";
import {
  Approver,
  CommentContainer,
  CommentHeading,
  CommentsListContainer,
  HistoryContainer, HistoryDateTime
} from "./styles";
import { formatContent } from "./utils";
import { useGetAdminUsersQuery } from "../../api/rtkQuery/commonApi";
import {formatDateTime} from "../../utils/dateFormatting";

interface HistoryCommentsProps {
  workFlowId: number,
  wrapperClass?: string;
  callbackCreateComment?: () => void;
  approver?: string
  approvalDate?: string
}

const Comments: FunctionComponent<HistoryCommentsProps> = ({workFlowId, wrapperClass, callbackCreateComment, approver, approvalDate}) => {
  const [socketUrl, setSocketUrl] = useState<string | null>(null);
  const {getAccessTokenSilently, isAuthenticated} = useAuth0();
  const {data: adminUsers} = useGetAdminUsersQuery({});

  const { lastMessage } = useWebSocket(socketUrl, {
    shouldReconnect: () => true,
    reconnectAttempts: 5,
    reconnectInterval: 3000
  });

  const users = useMemo(() => map(adminUsers, (user) => {
      return {
        id: user.id,
        display: `${user.user.first_name} ${user.user.last_name}`,
      }}
    ), [adminUsers]);

  useEffect(() => {
    if(isAuthenticated)
    getAccessTokenSilently().then((token: any) => {
      if(token){
        setSocketUrl(getWorkFlowCommentsUrl(workFlowId, token));
      }
    });
  }, [getAccessTokenSilently, isAuthenticated, workFlowId]);

  const comments = lastMessage ? JSON.parse(lastMessage.data) : [];


  return <CommentContainer className={wrapperClass || ""}>
    {approver && approvalDate && <div>
      <CommentHeading> History </CommentHeading>
      <HistoryContainer>
        Approved by <Approver>{approver}</Approver>
        <br></br>
        <HistoryDateTime>{formatDateTime(approvalDate)}</HistoryDateTime>
      </HistoryContainer>
      <br></br>
      <br></br>
    </div>}
    <CommentHeading>Comments</CommentHeading>
    <CommentsListContainer>
      {map(comments, (comment) => <CommentItem comment={{...comment, text: formatContent(comment.text, users).content}} />)}
    </CommentsListContainer>
    <CreateComment workFlowId={workFlowId} users={users} callbackCreateComment={callbackCreateComment || (() => {})} />
  </CommentContainer>
};


export default Comments;
