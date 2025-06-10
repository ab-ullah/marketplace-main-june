import {FunctionComponent} from "react";
import map from "lodash/map";
import {Comment} from "../../interfaces/workflows";
import CommentWrapper from "../../components/CommentWrapper";

interface ICommentsSection {
  fieldId: string;
  tik?: any;
  comments: { [key: string]: Comment[]; }
}

const CommentsSection: FunctionComponent<ICommentsSection> = ({fieldId, tik, comments}) => {
  const fieldComments = comments && comments[fieldId] as any
  const questionComments = fieldComments && fieldComments['']
  return (
    <>
      {map(questionComments, (comment: Comment, index) => (
        <CommentWrapper key={index} comment={comment}/>
      ))}
    </>
  );
};

export default CommentsSection;
