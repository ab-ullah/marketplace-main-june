import { Button, Modal } from "react-bootstrap";

const ExportSuccessModal = ({ isOpen, onClose, title}: any) => {
  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>{title ? title : "Carry Plans Export"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>Report will be emailed to you shortly.</h6>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="button" onClick={onClose}>
          Okay
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ExportSuccessModal;
