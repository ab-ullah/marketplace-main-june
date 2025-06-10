import React, { FunctionComponent, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { StyledPublishModal } from "./styles";
import WorkFlowReviewTask from "./index";

interface WorkFlowReviewTaskModalProps {
  workflowId: number;
  urlToCopy?: string;
}

const WorkFlowReviewTaskModal: FunctionComponent<
  WorkFlowReviewTaskModalProps
> = ({ workflowId }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const closeModal = () => setShowModal(false);
  return (
    <>
      <Button variant="primary float-end" onClick={() => setShowModal(true)}>
        Submit for Review
      </Button>
      <StyledPublishModal
        size={"lg"}
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Body>
          <WorkFlowReviewTask workflowId={workflowId} closeModal={closeModal} />
        </Modal.Body>
      </StyledPublishModal>
    </>
  );
};

export default WorkFlowReviewTaskModal;
