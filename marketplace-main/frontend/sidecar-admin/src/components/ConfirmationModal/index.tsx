import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

interface ConfirmationModalProps {
  title?: string;
  description?: string;
  data?: any;
  handleConfirm: any;
  handleCancel?: () => void;
}

const ConfirmationModal = ({
  title,
  description,
  handleConfirm,
  data,
  handleCancel,
}: ConfirmationModalProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => {
    setShowModal(false);
    if (handleCancel)  setTimeout(()=>handleCancel(),500)
  };

  useEffect(() => {
    setShowModal(true);
  }, []);

  return (
    <Modal size={"lg"} show={showModal} onHide={() => closeModal()}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{description}</Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-primary"
          type="cancel"
          className={"cancel-button"}
          onClick={closeModal}
        >
          Cancel
        </Button>
        <Button
          variant="outline-primary"
          type="submit"
          className={"submit-button"}
          onClick={() => handleConfirm(data)}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;

ConfirmationModal.defaultProps = {
  title: "Please confirm...",
  description: " Are you sure?",
  data: null,
  handleCancel: () => {},
};
