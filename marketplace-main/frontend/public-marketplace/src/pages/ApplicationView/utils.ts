/* eslint-disable @typescript-eslint/no-explicit-any */
import get from "lodash/get";
import filter from "lodash/filter";
import each from "lodash/each";
import countBy from "lodash/countBy";
import pick from "lodash/pick";
import sum from "lodash/sum";
import values from "lodash/values";
import { COMMENT_CREATED, COMMENT_UPDATED } from "../../constants/commentStatus";
import { PARTICIPANT } from "../../constants/commentModules";

// eslint-disable-next-line default-param-last
export const getTotalCommentsByModuleStatus = (comments: any, moduleId = 0, status: number) => {
  const filteredComments = filter(comments, (value) => (get(value, 'status') === status && value.module === moduleId));
  const counter = countBy(filteredComments, (comment) => comment.question_identifier);
  return sum(values(counter));
}

export const getTotalCommentsByModule = (comments: any, moduleId = 0) => {
  const commentCreatedCount = getTotalCommentsByModuleStatus(comments, moduleId, COMMENT_CREATED);
  if(commentCreatedCount > 0)
    return commentCreatedCount;
  const commentUpdatedCount = getTotalCommentsByModuleStatus(comments, moduleId, COMMENT_UPDATED);
  if(commentUpdatedCount > 0)
    return -1;
  return 0;
}

export const hasNonApprovedComments =  (comments: any, module: number, moduleId: any) => {
  if (!comments) return false
  const matchingComment = comments.find((comment: any) => [COMMENT_CREATED, COMMENT_UPDATED].includes(get(comment, 'status'))
    && comment.module === module
    && comment.module_id === moduleId)
  return !!matchingComment
}


// eslint-disable-next-line default-param-last
export const getTotalCommentsByStatus = (comments: any, ids: any, moduleId = 0, status: number) => {
  const filteredComments = filter(comments, (value) => {
    if(moduleId)
      return (get(value, 'status') === status && value.module === moduleId);
    return get(value, 'status') === status;
  });
  
  const counter = countBy(filteredComments, (comment) => comment.question_identifier);
  const selectedComments = pick(counter, ids);
  return sum(values(selectedComments));
}


export const getTotalComments = (comments: any, ids: any, moduleId = 0) => {
  const commentCreatedCount = getTotalCommentsByStatus(comments, ids, moduleId, COMMENT_CREATED);
  if(commentCreatedCount > 0)
    return commentCreatedCount;
  const commentUpdatedCount = getTotalCommentsByStatus(comments, ids, moduleId, COMMENT_UPDATED);
  if(commentUpdatedCount > 0)
    return -1;
  return 0;
}

export const getParticipantsCount = (comments: any, participantIds: any) => {
  const participantCount: any = {};
  each(participantIds, (participantId) => {
    const ids: string[] = [];
    each(comments, (comment) => {
      if(comment.question_identifier.indexOf(`participant_${participantId}`) === 0)
        ids.push(comment.question_identifier);
    });
    participantCount[`${participantId}`] = getTotalComments(comments, ids, PARTICIPANT);
  })
  return participantCount;
}
