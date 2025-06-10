import React, { FunctionComponent, memo, useState } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FinalizeContainer, FinalizeStatus as Status } from "./styles";
import { useUpdateFundsMutation } from "../../../../api/rtkQuery/fundsApi";

const finalizeTooltip =
  "The Finalize button will be available once a decision has been made on every applicant (approved, declined, withdrawn). By clicking this button, the investment is considered finalized and the investor information is ready to be added to your books & records.";


export interface FinalizeProps {
  fundId: number
  canBeFinalized: boolean
}


const Finalize: FunctionComponent<FinalizeProps> = ({ fundId, canBeFinalized }) => {
  const [showModal, setModal] = useState(false);
  const [updateFunds] = useUpdateFundsMutation();

  const handleFinalize = () => {
    updateFunds({fundId, is_finalized: true});
    setModal(false);
  }

  // this text should be improved, but at this moment it's ok
  const textForConfirm = "Are you sure you want to finalize this investment? This will close it\n" +
      "          to additional applicants and start the process of moving the investor\n" +
      "          information to your books"
  return (
    <>
      {canBeFinalized ? (
        <FinalizeContainer onClick={() => setModal(true)}>
          <Status canBeFinalized={canBeFinalized}>Finalize</Status>
        </FinalizeContainer>
      ) : (
        <Tooltip title={finalizeTooltip} arrow>
          <FinalizeContainer>
            <Status>Finalize</Status>
          </FinalizeContainer>
        </Tooltip>
      )}

      <Modal size={"lg"} show={showModal} onHide={() => setModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Finalize</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {textForConfirm}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => setModal(false)}>
            Close
          </Button>
          <Button disabled={false} onClick={handleFinalize}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default memo(Finalize);
