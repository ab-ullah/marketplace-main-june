import { FunctionComponent, useState } from "react";
import Modal from "react-bootstrap/Modal";
import EditIcon from "@material-ui/icons/Settings";
import { ModalHeading, StyledModal } from "../CreateCriteriaModal/styles";
import CreateCriteriaForm from "../CreateCriteriaModal/CreateCriteriaForm";
import { IFundBaseInfo } from "../../../../../../interfaces/fundDetails";
import {IEligibilityCriteria} from "../../../../../../interfaces/EligibilityCriteria/criteria";

interface EditCriteriaButtonProps {
  fund: IFundBaseInfo;
  criteria?: IEligibilityCriteria;
  disabled?: boolean;
}

const EditCriteriaButton: FunctionComponent<EditCriteriaButtonProps> = ({
  fund,
  criteria,
  disabled
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <EditIcon
        onClick={!disabled ? () => setShowModal(true) : undefined}
        className={"cursor-pointer"}
        style={{ fill: disabled ? "#ddd" : "#2E86DE" }}
      />
      <StyledModal
        size={"lg"}
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <ModalHeading>Edit eligibility criteria</ModalHeading>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateCriteriaForm fund={fund} criteria={criteria} closeModal={closeModal} />
        </Modal.Body>
      </StyledModal>
    </>
  );
};

export default EditCriteriaButton;
