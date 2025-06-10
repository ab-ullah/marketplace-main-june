import React, {FunctionComponent, useState} from 'react';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import CreateCompanyTokenForm from "./CreateTokenForm";


interface CreateCompanyTokenProps {

}


const CreateCompanyToken: FunctionComponent<CreateCompanyTokenProps> = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => setShowModal(false);

  return <>
    <Button onClick={() => setShowModal(true)} variant={'outline-primary'} className={"mb-3"}>+ Create New Company Token</Button>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Create Company Token</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreateCompanyTokenForm closeModal={closeModal}/>
      </Modal.Body>
    </Modal>
  </>;
};

export default CreateCompanyToken;
