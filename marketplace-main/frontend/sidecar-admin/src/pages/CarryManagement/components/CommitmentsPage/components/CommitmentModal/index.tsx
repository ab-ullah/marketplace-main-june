import { Modal } from "react-bootstrap";
import CommitmentForm from "./components/CommitmentForm";
import { isEmpty } from "lodash";
import EditCommitmentForm from "./components/EditCommitmentForm";

interface ICommitmentModalProps {
  handleCloseModal: (_refetch?:boolean) => void;
    initState?: any
}

const CommitmentModal = ({
  handleCloseModal,
  initState
}:
ICommitmentModalProps) => {
  return (
    <>
      <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton style={{ background: "#F5F7F8" }}>
          <Modal.Title>{initState?.participants ? "Edit Commitment" : "New Commitment"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            isEmpty(initState) ? <CommitmentForm initState={initState} closeModal={handleCloseModal} /> : 
            <EditCommitmentForm initState={initState} closeModal={handleCloseModal} />
          }
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CommitmentModal;
