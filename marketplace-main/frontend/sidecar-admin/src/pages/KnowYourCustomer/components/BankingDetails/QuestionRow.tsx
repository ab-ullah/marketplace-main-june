import { FunctionComponent } from "react";
import { Button } from "react-bootstrap";
import { IComment } from "../../../../interfaces/Workflow/comment";
import {
    QuestionFlag,
    QuestionContainer,
    QuestionLabel,
    QuestionInner,
    ReplySectionWrapper,
  } from "../../styles"
import Replies from "../Replies";
import { CommentApproveButton } from "../TaxFormDocument/styles";

interface IQuestionRow {
  label: string,
  value: string | undefined,
  flagged: boolean,
  handleClickFlag: () => void,
  handleApproveComment?: () => void
  hideFlag?: boolean;
  comment?: IComment;
}

const QuestionRow: FunctionComponent<IQuestionRow> = ({
    label,
    value,
    flagged,
    handleClickFlag,
    handleApproveComment,
    hideFlag,
    comment
  }) => (
    <>
    <QuestionContainer>
      <QuestionInner>
        <QuestionLabel>{label}</QuestionLabel>
      </QuestionInner>
      <QuestionInner>
        {value} {!hideFlag && <QuestionFlag flagged={flagged} onClick={handleClickFlag} />}
        {flagged && <CommentApproveButton onClick={handleApproveComment}>Approve</CommentApproveButton>}
      </QuestionInner>
    </QuestionContainer>
    <ReplySectionWrapper>
      <Replies comment={comment}/>
    </ReplySectionWrapper>
    </>
  );
  
  export default QuestionRow;