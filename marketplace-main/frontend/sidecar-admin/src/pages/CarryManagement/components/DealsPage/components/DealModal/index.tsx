import { Modal } from "react-bootstrap";
import DealForm from "./components/DealForm";

interface IDealModalProps {
  handleCloseModal: () => void;
  handleUpdateDealsList: (newDeal: Record<string, any>) => void;
  initState?: any
}

const DealModal = ({
  handleCloseModal,
  handleUpdateDealsList,
  initState
}: IDealModalProps) => {
  return (
    <>
      <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton style={{background:'#F5F7F8'}}>
          <Modal.Title>{initState?.dealId ? "Edit": "New"} Deal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DealForm
            closeModal={handleCloseModal}
            handleUpdateDealsList={handleUpdateDealsList}
            initState={initState}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DealModal;
