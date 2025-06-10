import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import AllocationsForm from "./components/AllocationsForm";

const AllocationsModal = ({poolAllocations,unAllocatedBps,hierarchy,refetchData}:any) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const closeModal = () => setShowModal(false);
  return (
    <>
      <div>
        <Button
          onClick={() => setShowModal(true)}
          variant={"primary"}
          className={"mb-3"}
        >
         Manage Allocations
        </Button>
      </div>
      <Modal size={"lg"} show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Allocations</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <AllocationsForm
         closeModal={closeModal}
         poolAllocations={poolAllocations}
         unAllocatedBps={unAllocatedBps}
         hierarchy={hierarchy}
         refetchData={refetchData}

         />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AllocationsModal;
