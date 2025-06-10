import Modal from "react-bootstrap/Modal";
import { SecondaryButton } from "../../../styles";
import CarryDiluteForm from "./components/CarryDiluteForm";
import { useState } from "react";
import { toast } from "react-toastify";
import API from "../../../../../../api/backendApi";

interface ICarryDiluteModalProps {
  handleCloseModal: () => void;
  initState: Record<string, any>;
  refreshData: (plandId: string) => void;
}

const CarryDiluteModal = ({
  handleCloseModal,
  initState,
  refreshData,
}: ICarryDiluteModalProps) => {
  const { carryPlanId } = initState;
  const [dilutePayload, setDilutePayload] = useState<null | Record<
    string,
    any
  >>(null);
  const [hasError, setHasError] = useState(false)

  const handleAllocationsDilution = async () => {
    const res = await API.createAllocationsDilution(carryPlanId, dilutePayload);
    if (res.success) {
      refreshData(carryPlanId);
      toast.success("Allocations Diluted Successfully!!")
      handleCloseModal();
    }
    else{
      toast.error("Something went wrong !!")
    }
  };
  return (
    <>
      <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
        <Modal.Header closeButton>
          <Modal.Title>Create Dilution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CarryDiluteForm
            carryPlanDetail={initState}
            setDilutePayload={setDilutePayload}
            setHasError={(err:boolean)=>setHasError(err)}
          />
        </Modal.Body>
        <Modal.Footer>
          <SecondaryButton
            disabled={!dilutePayload || hasError}
            onClick={handleAllocationsDilution}
          >
            Create Dilution
          </SecondaryButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CarryDiluteModal;
