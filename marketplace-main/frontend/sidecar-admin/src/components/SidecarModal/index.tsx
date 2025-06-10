import React, { FunctionComponent, memo } from "react";
import Modal from "react-bootstrap/Modal";

interface SidecarModalProps {
    title: string, 
    showModal: boolean, 
    handleClose: () => void,
    children: any
}

const SidecarModal: FunctionComponent<SidecarModalProps> = ({
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
    </Modal>
  );
};

export default memo(SidecarModal);
