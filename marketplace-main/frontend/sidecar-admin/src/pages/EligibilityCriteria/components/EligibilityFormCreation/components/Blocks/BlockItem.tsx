import React, { FunctionComponent, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IBlock } from "../../../../../../interfaces/EligibilityCriteria/blocks";
import { useAppDispatch, useAppSelector } from "../../../../../../app/hooks";
import { selectSelectedCriteriaDetail } from "../../../../selectors";
import API from "../../../../../../api";
import { getFundCriteriaDetail } from "../../../../thunks";
import classNames from "classnames";
import { getCriteriaIcon } from "../../../../../../utils/getCriteriaIcon";
import { ICriteriaBlock } from "../../../../../../interfaces/EligibilityCriteria/criteria";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

interface BlocksItemProps {
  isSelectedBlock: boolean;
  block: IBlock;
  callbackSelectModal: (block: IBlock) => void;
}

const BlockItem: FunctionComponent<BlocksItemProps> = ({
  block,
  isSelectedBlock,
  callbackSelectModal,
}) => {
  const selectedCriteria = useAppSelector(selectSelectedCriteriaDetail);
  const [disabled, setDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();
  const notify = () => toast("Block Added to Form");

  if (!selectedCriteria) return <></>;

  const onClick = async () => {
    if (disabled) return;
    setDisabled(true);
    const payload = {
      block: block.id,
      criteria: selectedCriteria.id,
    };
    const resp = await API.createCriteriaBlock(selectedCriteria.id, payload);
    notify();
    await dispatch(getFundCriteriaDetail(selectedCriteria.id));
    setDisabled(false);
    callbackSelectModal(resp);
  };
  const criteriaBlock = { block } as ICriteriaBlock;
  return (
    <>
      <div
        onClick={isSelectedBlock ? () => setShowModal(true) : onClick}
        className={classNames("add-block-card mb-3 mr-2", {
          "bg-gray": isSelectedBlock,
        })}
      >
        <div className={"img-div"}>
          <img
            src={getCriteriaIcon(criteriaBlock)}
            width={24}
            height={24}
            alt="block-icon"
          />
        </div>
        <p>{block.heading}</p>
      </div>
      <Modal size={'lg'} centered show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Warning</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to add this block again?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => setShowModal(false)}>No</Button>
        <Button variant="primary" onClick={() => {
          onClick();
          setShowModal(false);
        }}>Yes</Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default BlockItem;
