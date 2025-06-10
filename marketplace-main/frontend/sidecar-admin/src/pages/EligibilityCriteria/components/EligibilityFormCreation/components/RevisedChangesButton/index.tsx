import React, {FunctionComponent, useState} from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import {getFundCriteriaDetail} from "../../../../thunks";
import {useAppDispatch} from "../../../../../../app/hooks";
import {fetchTaskCount} from "../../../../../Tasks/thunks";
import workflowAPI from "../../../../../../api/workflowAPI";


interface ApproveButtonProps {
  workflowId: number;
  criteriaId: number;
  showNotification: () => void;
}


const RequestRevisionButton: FunctionComponent<ApproveButtonProps> = ({workflowId, criteriaId, showNotification}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const dispatch = useAppDispatch()

  const revisedChanges = async () => {
    await workflowAPI.revisedChanges(workflowId)
    dispatch(fetchTaskCount())
    dispatch(getFundCriteriaDetail(criteriaId))
    showNotification()
  }

  const closeModal = () => setShowModal(false);

  return <>
    <Button onClick={revisedChanges} variant={'outline-primary'}>Resubmit for Review</Button>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Revision Requested</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Your updates have been sent to the reviewers for review. You will receive a notification when it’s
        published or need further changes.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  </>;
};

export default RequestRevisionButton;
