import React, { FC } from 'react';
import { Button, Modal } from 'react-bootstrap';

interface ConfirmationModalProps {
    show: boolean;
    hideDeleteModal: () => void;
    onDeleteTemplate: () => void;
}

const DeletionConfirmationModal: FC<ConfirmationModalProps> = ({
    show,
    hideDeleteModal,
    onDeleteTemplate
}) => {
    return <Modal show={show} onHide={hideDeleteModal}>
    <Modal.Header>
      Delete Template
    </Modal.Header>
    <Modal.Body>
    Are you sure you want to delete this custom smart block template?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="outline-primary" onClick={hideDeleteModal}>Cancel</Button>
      <Button variant="primary" onClick={onDeleteTemplate}>Delete</Button>
    </Modal.Footer>
  </Modal>
}

export default DeletionConfirmationModal;