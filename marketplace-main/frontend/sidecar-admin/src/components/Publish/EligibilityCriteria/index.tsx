import React, {FunctionComponent, useState} from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import {PUBLISHED} from "../../../constants/eligibilityCriteriaStatus";
import Api from "../../../api";
import {getFundCriteriaDetail} from "../../../pages/EligibilityCriteria/thunks";
import {useAppDispatch} from "../../../app/hooks";
import {fetchTaskCount} from "../../../pages/Tasks/thunks";


interface PublishCriteriaProps {
  criteriaId: number;
  showNotification: () => void;
}


const PublishCriteriaButton: FunctionComponent<PublishCriteriaProps> = ({criteriaId, showNotification}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const dispatch = useAppDispatch()

  const approveTask = async () => {
    const payload = {status: PUBLISHED}
    await Api.updateFundCriteria(criteriaId, payload)
    dispatch(fetchTaskCount())
    dispatch(getFundCriteriaDetail(criteriaId))
    showNotification()
  }

  const closeModal = () => setShowModal(false);

  return <>
    <Button onClick={approveTask} variant={'outline-primary'}>Publish</Button>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Published</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Congratulations! Your eligibility criteria has been published
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  </>;
};

export default PublishCriteriaButton;
