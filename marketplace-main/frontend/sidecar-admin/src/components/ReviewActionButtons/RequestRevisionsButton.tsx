import React, {FunctionComponent, useState} from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {CHANGES_REQUESTED} from "../../constants/taskStatus";
import workflowAPI from "../../api/workflowAPI";
import {useAppDispatch} from "../../app/hooks";
import {fetchTaskDetail} from "../../pages/TaskReview/thunks";


interface ApproveButtonProps {
  taskId: number;
  allowSubmitRevision: boolean;
  showSubmitNotification: () => void;
  showCommentRequiredNotification: () => void;
}


const RequestRevisionButton: FunctionComponent<ApproveButtonProps> = ({taskId, allowSubmitRevision, showSubmitNotification, showCommentRequiredNotification}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const dispatch = useAppDispatch()

  const approveTask = async () => {
    if(!allowSubmitRevision){
      showCommentRequiredNotification();
      return;
    }
    const payload = {status: CHANGES_REQUESTED}
    await workflowAPI.updateTask(taskId, payload)
    showSubmitNotification()
    dispatch(fetchTaskDetail(taskId))
  }

  const closeModal = () => setShowModal(false);

  return <>
    <Button onClick={approveTask} variant={'outline-danger'} className={"mb-3"}>Request Revisions</Button>
    <Modal size={'lg'} show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Revision Requested</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Your comments have been sent to the admin to make requested changes. You will receive a notification when it’s
        ready for review again.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  </>;
};

export default RequestRevisionButton;
