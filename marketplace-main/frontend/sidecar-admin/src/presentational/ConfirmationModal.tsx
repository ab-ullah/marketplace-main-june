import { FunctionComponent } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

interface ConfirmationModalProps {
  show: boolean;
  handleSubmit: () => void;
  handleClose: () => void;
  msg?: string;
}

const ConfirmationModal: FunctionComponent<ConfirmationModalProps> = ({
  show,
  handleSubmit,
  handleClose,
  msg,
}) => {
  return (
    <Modal size={"lg"} centered show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Warning</Modal.Title>
      </Modal.Header>
      <Modal.Body>{msg && <p>{msg}</p>}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={handleClose}>
          No
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            handleSubmit();
            handleClose();
          }}
        >
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
