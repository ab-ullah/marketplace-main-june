import { FunctionComponent, useState } from "react";
import get from "lodash/get";
import Modal from "react-bootstrap/Modal";
import styled from "styled-components";
import MenuIcon from "@material-ui/icons/MoreVert";
import Popover from "@material-ui/core/Popover";
import ConfirmationModal from "../../../../../Funds/components/FundsList/ConfirmationModal";
import { IFundBaseInfo } from "../../../../../../interfaces/fundDetails";
import { IEligibilityCriteria } from "../../../../../../interfaces/EligibilityCriteria/criteria";
import CreateCriteriaForm from "../CreateCriteriaModal/CreateCriteriaForm";
import {
  Link,
  MenuIconWrapper,
} from "../../../../../FundSetup/components/ApplicantsList/styles";
import { ModalHeading, StyledModal } from "../CreateCriteriaModal/styles";

const AppLink = styled(Link)`
  width: 208px;
  color: #444 !important;
  font-size: 14px;
  text-align: left;
  text-decoration: none;
  border-bottom: 1px dashed;
  &.disabled {
    color: #aaa !important;
    cursor: not-allowed;
  }
`;

enum IModals {
  NONE = "",
  EDIT = "edit",
  DELETE = "delete",
}

interface IActions {
  fund: IFundBaseInfo;
  criteria?: IEligibilityCriteria;
  handleDelete: (eligbilityCriteriaId: number) => void;
  disabled?: boolean;
}

const Actions: FunctionComponent<IActions> = ({ fund, criteria, disabled, handleDelete }) => {
  const [activeModal, setActiveModal] = useState<IModals>(IModals.NONE);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseModal = () => {
    setActiveModal(IModals.NONE);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <div>
        <MenuIconWrapper onClick={handleClick}>
          <MenuIcon />
        </MenuIconWrapper>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <AppLink
            to="/"
            className={disabled ? "disabled" : ""}
            onClick={(e: any) => {
              e.preventDefault();
              handleClose();
              if(!disabled)
                setActiveModal(IModals.EDIT);
            }}
          >
            Edit
          </AppLink>
          <AppLink
            to="/"
            className={disabled ? "disabled" : ""}
            onClick={(e: any) => {
              e.preventDefault();
              handleClose();
              if(!disabled)
                setActiveModal(IModals.DELETE);
            }}
          >
            Delete
          </AppLink>
        </Popover>
        <ConfirmationModal
          title="Delete eligibility criteria"
          showModal={activeModal === IModals.DELETE}
          handleClose={handleCloseModal}
          handleSubmit={() => {
            criteria && handleDelete(criteria.id);
            handleCloseModal();
          }}
        >
          Are you sure you want to delete this eligibility criteria?
        </ConfirmationModal>
      </div>
      <StyledModal size={"lg"} show={activeModal === IModals.EDIT} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            <ModalHeading>Edit eligibility criteria</ModalHeading>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateCriteriaForm
            fund={fund}
            criteria={criteria}
            closeModal={handleCloseModal}
          />
        </Modal.Body>
      </StyledModal>
    </>
  );
};

export default Actions;
