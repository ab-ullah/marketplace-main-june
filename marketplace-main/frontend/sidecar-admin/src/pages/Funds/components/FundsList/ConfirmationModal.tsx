import React, { FunctionComponent, memo } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

interface ConfirmationModalProps {
  title: string;
  submitLabel?: string;
  showModal: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  children: any;
  submitDisabled?: boolean;
}

const ConfirmationModal: FunctionComponent<ConfirmationModalProps> = ({
  title,
  submitLabel,
  showModal,
  handleSubmit,
  handleClose,
  children,
  submitDisabled
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
        <Button disabled={submitDisabled} onClick={handleSubmit}>{submitLabel}</Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmationModal.defaultProps = {
  submitLabel: "Submit",
  submitDisabled: false
};

export default memo(ConfirmationModal);
