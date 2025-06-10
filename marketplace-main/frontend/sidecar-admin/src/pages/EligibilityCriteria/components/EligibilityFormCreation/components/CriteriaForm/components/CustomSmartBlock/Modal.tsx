import { FunctionComponent } from "react";
import Modal from "react-bootstrap/Modal";
import { ModalHeading } from "./styles";
import { EligibilityModal } from "../../../../../../../../presentational/EligibilityModal";
import CustomSmartBlock from ".";

interface ICustomSmartBlockModal {
  showModal: boolean;
  hideModal: () => void;
}

const CustomSmartBlockModal: FunctionComponent<ICustomSmartBlockModal> = ({
  showModal,
  hideModal,
}) => {
  return (
    <>
      <EligibilityModal
        size={"xl"}
        show={showModal}
        onHide={hideModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <ModalHeading>Custom Smart Block</ModalHeading>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModal && (

            <CustomSmartBlock refetchOnUnmount={true}/>
          )}
        </Modal.Body>
      </EligibilityModal>
    </>
  );
};

export default CustomSmartBlockModal;
