import { Modal } from "react-bootstrap";
import InvestmentTrancheForm from "./components/InvestmentTrancheForm";

interface IInvestmentTrancheModalProps {
  handleCloseModal: () => void;
  handleUpdateTranchList: () => void;
  initState?: any
}

const InvestmentTrancheModal = ({
  handleCloseModal,
  handleUpdateTranchList,
  initState
}: IInvestmentTrancheModalProps) => {
  return (
    <>
      <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton style={{background:'#F5F7F8'}}>
          <Modal.Title>{initState?.id ? "Edit": "New"} Investment Tranche</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InvestmentTrancheForm initState={initState} closeModal={handleCloseModal} handleUpdateTranchList={handleUpdateTranchList} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default InvestmentTrancheModal;
