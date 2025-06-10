import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import CarryPoolForm from "./components/CarryPoolForm";
import EditIcon from "@material-ui/icons/Settings";

const CarryPoolModal = ({ pool, refetchData, hierarchy, unAllocatedBps,disabled }: { pool?: any; refetchData?: any,hierarchy:any[], unAllocatedBps:number,disabled?:boolean }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const title = pool ? "Edit" : "Create";

  const closeModal = () => setShowModal(false);
  return (
    <>
    <div style={disabled?{cursor:'not-allowed', opacity:'40%',pointerEvents:'none'}:{}}>
      {pool ? (
        <EditIcon
          onClick={() => setShowModal(true)}
          className={"cursor-pointer"}
          style={{ fill: "#2E86DE" }}
        />
      ) : (
        <Button
          onClick={() => setShowModal(true)}
          variant={"primary"}
          className={"mb-3"}
          disabled={disabled}
        >
          + Create Pool
        </Button>
      )}
      </div>
      <Modal size={"lg"} show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{title} Pool</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CarryPoolForm
            closeModal={closeModal}
            pool={pool}
            refetchData={refetchData}
            hierarchy={hierarchy}
            unAllocatedBps={unAllocatedBps}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CarryPoolModal;
