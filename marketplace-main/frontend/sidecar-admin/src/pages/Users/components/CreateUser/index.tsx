import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import {StyledButton} from "../../../../presentational/buttons";
import CreateUserForm from "./CreateUserForm";


interface CreateUserProps {

}


const CreateUserButton: FunctionComponent<CreateUserProps> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => setShowModal(false);

  return <>
    <StyledButton onClick={() => setShowModal(true)} variant={'outline-primary'}>Add</StyledButton>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Add User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreateUserForm closeModal={closeModal}/>
      </Modal.Body>
    </Modal>
  </>;
};

export default CreateUserButton;
