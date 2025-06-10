import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { ApproveButton, IconButton, RowItem } from "../../styles";

const ConfirmationModal = ({
  showModal,
  handleHide,
  handleConfirmApprove,
  confirmed,
  displayText,
}: any) => {
  const { title, description } = displayText;
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    setIsLoading(true);
    await handleConfirmApprove();
    setIsLoading(false);
  };

  return (
    <Modal size={"lg"} show={showModal} onHide={() => handleHide()} backdrop='static'>
      <Modal.Header closeButton>
        <Modal.Title>
          {confirmed ? title.confirmed : title.notConfirmed}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{confirmed ? description.confirmed : description.notConfirmed}</p>
        {!confirmed && (
          <RowItem style={{ justifyContent: "flex-end" }}>
            <IconButton variant="outline-primary" onClick={() => handleHide()}>
              Cancel
            </IconButton>
            <ApproveButton
              variant="primary"
              onClick={() => handleSubmit()}
              disabled={isLoading}
            >
              Confirm
            </ApproveButton>
          </RowItem>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmationModal;
