import React, {FunctionComponent, useState} from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";


interface ReviewRequestedModalProps {
}


const ReviewRequestedModal: FunctionComponent<ReviewRequestedModalProps> = () => {
  const [showModal, setShowModal] = useState<boolean>(true);

  const closeModal = () => setShowModal(false);

  return <>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>You have been selected to review this form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Please ensure you review the Logic view and optionally review the preview. You can leave comments for the admin
        with notes and changes. Please ensure you click either <b>"Approve"</b> or <b>"Request Revisions"</b> to record your review
        decision.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={closeModal}>Close</Button>
      </Modal.Footer>
    </Modal>
  </>;
};

export default ReviewRequestedModal;
