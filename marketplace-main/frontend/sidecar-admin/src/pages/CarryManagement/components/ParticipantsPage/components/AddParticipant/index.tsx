import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import AddParticipantForm from "./components/AddParticipantForm";
import { TopButton } from "../../../styles";

const AddParticipant = ({handleRefetchParticipants}:any) => {
    const [showModal, setShowModal] = useState<boolean>(false);

    const closeModal = () => setShowModal(false);
    return ( 
        <>
        <TopButton
          onClick={() => setShowModal(true)}
          variant={"primary"}
          className={"mb-3"}
        >
          + Add Participant
        </TopButton>
        <Modal
          size={"lg"}
          show={showModal}
          onHide={() => setShowModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Participant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddParticipantForm closeModal={closeModal} handleRefetchParticipants={handleRefetchParticipants}/>
          </Modal.Body>
        </Modal>
      </>
     );
}
 
export default AddParticipant;