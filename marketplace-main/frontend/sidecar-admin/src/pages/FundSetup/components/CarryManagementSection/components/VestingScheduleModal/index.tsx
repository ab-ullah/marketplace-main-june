import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import ViewIcon from "@material-ui/icons/RemoveRedEyeOutlined";
import VestingScheduleForm from "./components/VestingScheduleForm";

const VestingScheduleModal = ({
  disabled,
  vestingSchedules,
  hierarchy,
  allocation,
}: {
  disabled?: boolean;
  vestingSchedules: any[];
  hierarchy: any[];
  allocation: any;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const closeModal = () => setShowModal(false);
  return (
    <>
      <div
        style={
          disabled
            ? { cursor: "not-allowed", opacity: "40%", pointerEvents: "none" }
            : {}
        }
      >
        <ViewIcon
          onClick={() => (disabled ? {} : setShowModal(true))}
          className={"cursor-pointer"}
          style={{ fill: "#2E86DE", marginLeft: "5px" }}
        />
      </div>
      <Modal size={"lg"} show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Calculate Vesting Points</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VestingScheduleForm
            closeModal={closeModal}
            schedules={vestingSchedules}
            hierarchy={hierarchy}
            allocation={allocation}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VestingScheduleModal;
