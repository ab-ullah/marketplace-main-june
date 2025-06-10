import React, {FunctionComponent, useEffect, useState} from 'react';
import {Badge, CloseButton, Form, ListGroup, Modal} from "react-bootstrap";
import clockIcon from "../../assets/images/clock-icon.svg"
import {PublishForm, ReviewersList} from "./styles";
import Select from "react-select";
import Button from "react-bootstrap/Button";
import workflowAPI from "../../api/workflowAPI";

interface SubmitForReviewProps {
  urlToCopy?: string;
  closeModal: () => void;
  workflowId: number;
}


const WorkFlowReviewTask: FunctionComponent<SubmitForReviewProps> = (
  {
    closeModal,
    workflowId
  }
) => {
  const [reviewersData, setReviewersData] = useState<any>(null);
  const [newReviewers, setNewReviewers] = useState<any>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const fetchReviewerTasks = async () => {
    const data = await workflowAPI.getTaskReviewers(workflowId)
    setReviewersData(data)
  }

  useEffect(() => {
    fetchReviewerTasks()
  }, [])

  const onSave = async () => {
    const userIds = newReviewers.map((reviewer: any) => reviewer.value)
    const payload = {
      users: userIds
    }
    await workflowAPI.createTaskReviewers(workflowId, payload)
    setSubmitted(true)
  }

  const onDelete = async (taskId: number) => {
    await workflowAPI.deleteTask(taskId)
    await fetchReviewerTasks()
  }

  if (!reviewersData) return <></>

  if (submitted) return <>
    <h4>Request for review successfully sent</h4>
    <p className={'mt-4'}>Congratulations! The form was successfully posted, you can find it in the list of forms, edit
      it, or move it back to drafts</p>
  </>

  return <>
    <h4 className={'mb-5'}>Submit for Review</h4>
    <PublishForm>
      <p>Please choose the users you would like to preview and approve the flow prior to publishing.</p>
      <Form.Group className="mb-2">
        <Form.Label>Reviewers</Form.Label>
        <Select
          placeholder={'Select User(s)'}
          onChange={(value) => setNewReviewers(value)}
          className="basic-single"
          classNamePrefix="select"
          isMulti={true}
          isSearchable={true}
          value={newReviewers}
          name={'reviewers'}
          options={reviewersData.available_reviewers}
        />
      </Form.Group>
    </PublishForm>

    <ReviewersList className="preview-publish-list">
      {reviewersData.reviewers.map((reviewer: any) => <ListGroup.Item>
          <Badge bg="secondary">{reviewer.reviewer_name} <CloseButton onClick={() => onDelete(reviewer.id)}/></Badge>
          <span className="float-end">
                Waiting <img src={clockIcon} alt="Clock icon"/>
              </span>
        </ListGroup.Item>
      )}
    </ReviewersList>
    <Modal.Footer>
      <Button variant="outline-primary" onClick={closeModal}>Cancel</Button>
      <Button variant="primary" onClick={onSave}>Send</Button>
    </Modal.Footer>
  </>;
};

export default WorkFlowReviewTask;
