import React, { FunctionComponent, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import workflowAPI from "../../api/workflowAPI";
import { useAppDispatch } from "../../app/hooks";
import { addComment } from "../../pages/TaskReview/taskReviewSlice";
import { formatContent, IUser } from "./utils";
import { AddCommentButton, TextAreaDiv } from "./styles";

interface CreateCommentProps {
  workFlowId: number;
  users: IUser[];
  callbackCreateComment: () => void;
}

const CreateComment: FunctionComponent<CreateCommentProps> = ({
  workFlowId,
  users,
  callbackCreateComment,
}) => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const createComment = async () => {
    setSubmitting(true);
    const { selectedUsers, inputContent } = formatContent(value, users)
    const payload = {
      text: inputContent,
      users: selectedUsers,
      workflow: workFlowId,
    };
    const data = await workflowAPI.createComment(workFlowId, payload);
    await dispatch(addComment(data));
    setValue("");
    setSubmitting(false);
    callbackCreateComment();
  };

  const handleChange = (e: { target: { value: string; }; }) => {
    setValue(e.target.value);
  };

  

  return (
    <TextAreaDiv>
      <MentionsInput value={value} onChange={handleChange} className="textArea multiLine">
        <Mention
          trigger="@"
          data={users}
          className="mention"
          appendSpaceOnAdd={true}
          renderSuggestion={(
            suggestion,
            search,
            highlightedDisplay,
            index,
            focused
          ) => (
            <div className={`user ${focused ? "focused" : ""}`}>
              {highlightedDisplay}
            </div>
          )}
        />
      </MentionsInput>
      <div>
        <AddCommentButton
          variant={"outline-primary"}
          disabled={submitting}
          onClick={createComment}
        >
          Add Comment
        </AddCommentButton>
      </div>
    </TextAreaDiv>
  );
};

export default CreateComment;
