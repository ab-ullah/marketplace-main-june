import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "react-bootstrap/Modal";
import { Dropdown } from "react-bootstrap";
import DilutionForm from "./components/DilutionForm";

const Cont = styled.div`
  .dropdown-item.disabled {
    opacity: 0.3 !important;
  }
`;

const CarryDiluteModal = ({
  pool,
  refetchData,
  hierarchy,
  unAllocatedBps,
  disabled,
}: {
  pool?: any;
  refetchData?: any;
  hierarchy: any[];
  unAllocatedBps: number;
  disabled?: boolean;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [diluteMode, setDiluteMode] = useState<string>("");

  const closeModal = () => setDiluteMode("");
  const handleSelect = (opt: string) => {
    setDiluteMode(opt);
  };

  useEffect(() => {
    setShowModal(!!diluteMode);
  }, [diluteMode]);

  const hasPools = (pool?.pools || []).length > 0
  const hasAllocations = (pool?.allocations || []).length > 0
   const disableDilute = !(hasPools || hasAllocations)

  const disablePool = disableDilute
  const disableAllocation = disableDilute || !(hierarchy.length > 1)

  return (
    <>
      <Cont
        style={
          disabled
            ? { cursor: "not-allowed", opacity: "40%", pointerEvents: "none" }
            : {}
        }
      >
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Dilute
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => handleSelect("pool")}
              disabled={disablePool}
            >
              Add Pool
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => handleSelect("allocation")}
              disabled={disableAllocation}
            >
              Add Allocation
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Cont>
      <Modal size={"lg"} show={showModal} onHide={() => closeModal()}>
        <Modal.Header closeButton>
          <Modal.Title>Dilution Modal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DilutionForm
            closeModal={closeModal}
            pool={pool}
            refetchData={refetchData}
            hierarchy={hierarchy}
            unAllocatedBps={unAllocatedBps}
            dilutionMode={diluteMode}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CarryDiluteModal;
