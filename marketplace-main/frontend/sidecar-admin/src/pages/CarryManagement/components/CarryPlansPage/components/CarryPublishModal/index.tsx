import Modal from "react-bootstrap/Modal";
import { PillButton } from "../../../styles";
import CustomRadioGroup from "../../../../../../components/Form/CustomRadioGroup";
import { useState } from "react";
import API from "../../../../../../api/backendApi";

const shouldReleaseOptions = [
  {
    label: "Publish and release documents",
    value: true,
    description:
      "Carry allocations will be updated in the participant’s dashboard. Participants will be notificed and prompted to review carry documents. ",
  },
  {
    label: "Publish and don’t release documents",
    value: false,
    description:
      "Carry allocations will be updated in the participant’s dashboard. You can release notifications and documents at a later time in the carry documents section.",
  },
];

const CarryPublishModal = ({ handleCloseModal, carryDetail }: any) => {
  const { has_unreleased_documents, carryPlanId } = carryDetail;
  const [shouldRelease, setShouldRelease] = useState<any>(
    shouldReleaseOptions[1]
  );
  const title = has_unreleased_documents
    ? "Publish allocations and release documents?"
    : "Publish allocations?";

  const handlePublish = async () => {
    const res = await API.publishCarryPlan(carryPlanId, {
      release_documents: shouldRelease?.value,
    });
    if (res.success) {
      handleCloseModal(true);
    }
  };

  return (
    <Modal size={"xl"} show={true} onHide={() => handleCloseModal()}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {has_unreleased_documents ? (
          <div>
            <CustomRadioGroup
              title=""
              name="shouldRelease"
              onChange={(value: any) => setShouldRelease(value)}
              options={shouldReleaseOptions}
              value={shouldRelease}
            />
          </div>
        ) : (
          <p>
            Carry allocations will be updated in the participant’s dashboard
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <PillButton
          borderColor="#4A47A3"
          color="#4A47A3"
          font={{ "font-size": "14px", "font-family": "Quicksand Bold" }}
          onClick={() => handleCloseModal()}
        >
          Cancel
        </PillButton>
        <PillButton
          borderColor="#4A47A3"
          color="white"
          borderWidth="1px"
          background="#4A47A3"
          font={{ "font-size": "14px", "font-family": "Quicksand Bold" }}
          onClick={() => handlePublish()}
        >
          Publish
        </PillButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CarryPublishModal;
