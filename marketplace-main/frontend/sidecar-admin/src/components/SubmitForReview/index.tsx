import React, {FunctionComponent, useState} from 'react';
import {Badge, CloseButton, Form, ListGroup, Modal} from "react-bootstrap";
import clockIcon from "../../assets/images/clock-icon.svg"
import {CopyTextDiv, PublishForm, ReviewersList} from "./styles";
import Select from "react-select";
import Button from "react-bootstrap/Button";
import {CopyToClipboard} from 'react-copy-to-clipboard';

import shareIcon from "../../assets/images/share-icon.svg";


interface SubmitForReviewProps {
  closeModal: () => void;
  currentReviewers: any[];
  availableReviewers: any[];
  urlToCopy: string;
  onSave: (reviewers: number[]) => void
  onDelete: (id: number) => void
}


const SubmitForReview: FunctionComponent<SubmitForReviewProps> = (
  {
    closeModal,
    urlToCopy,
    currentReviewers,
    availableReviewers,
    onSave,
    onDelete
  }
) => {
  const [newReviewers, setNewReviewers] = useState<any>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSave = async () => {
    const userIds = newReviewers.map((reviewer: any) => reviewer.value)
    await onSave(userIds);
    setSubmitted(true)
  }


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
          options={availableReviewers}
        />
      </Form.Group>
    </PublishForm>

    <ReviewersList className="preview-publish-list">
      {currentReviewers.map((reviewer: any) => <ListGroup.Item>
          <Badge bg="secondary">{reviewer.reviewer_name} <CloseButton onClick={() => onDelete(reviewer.id)}/></Badge>
          <span className="float-end">
                Waiting <img src={clockIcon} alt="Clock icon"/>
              </span>
        </ListGroup.Item>
      )}
    </ReviewersList>
    <Modal.Footer>
      <CopyTextDiv>
        <CopyToClipboard text={urlToCopy}>
          <span className={'text-img'}><img src={shareIcon} className={'me-1'} alt="share-icon"/>Copy link to draft for approval</span>
        </CopyToClipboard>
      </CopyTextDiv>
      <Button variant="outline-primary" onClick={closeModal}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Send</Button>
    </Modal.Footer>
  </>;
};

export default SubmitForReview;
