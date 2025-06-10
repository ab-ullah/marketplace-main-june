import React, {FunctionComponent, useState} from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {APPROVED} from "../../constants/taskStatus";
import workflowAPI from "../../api/workflowAPI";
import {useAppDispatch} from "../../app/hooks";
import {fetchTaskDetail} from "../../pages/TaskReview/thunks";


interface ApproveButtonProps {
  taskId: number;
  showNotification: () => void;
  disabled?: boolean;
  onTaskApproved?: () => void; 
}


const ApproveButton: FunctionComponent<ApproveButtonProps> = ({taskId, showNotification, disabled, onTaskApproved}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const dispatch = useAppDispatch()

  const approveTask = async () => {
    const payload = {status: APPROVED, completed: true}
    await workflowAPI.updateTask(taskId, payload)
    showNotification()
    dispatch(fetchTaskDetail(taskId))
    onTaskApproved && onTaskApproved()
  }

  const closeModal = () => setShowModal(false);

  return <>
    <Button onClick={approveTask} variant={'primary'} className={"mb-3"} disabled={disabled}>Approve</Button>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Form Approved</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Congratulations! The form has been successfully approved.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  </>;
};

export default ApproveButton;
