import React, { FunctionComponent, memo } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

interface NotificationModalProps {
    title: string, 
    showModal: boolean, 
    handleClose: () => void,
    children: any
}

const NotificationModal: FunctionComponent<NotificationModalProps> = ({
  title, 
  showModal, 
  handleClose,
  children
}) => {
  return (
    <Modal size={"lg"} show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default memo(NotificationModal);
