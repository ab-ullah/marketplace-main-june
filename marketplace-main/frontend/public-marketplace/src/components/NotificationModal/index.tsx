import React, { FunctionComponent, memo } from "react";
import Modal from "react-bootstrap/Modal";
import { ModalContainer } from "./styles";
import ThemeButton from "components/Button/ThemeButton";

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
    <ModalContainer size={"lg"} show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <ThemeButton variant="outlined" onClick={handleClose}>Close</ThemeButton>
      </Modal.Footer>
    </ModalContainer>
  );
};

export default memo(NotificationModal);
