import React, {FunctionComponent, useState} from 'react';
import CreateFundForm from "./CreateFundForm";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {IFund} from "../../interfaces";


interface CreateFundProps {
  fund?: IFund
}


const CreateFund: FunctionComponent<CreateFundProps> = ({fund}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => setShowModal(false);

  return <>
    <Button onClick={() => setShowModal(true)} variant={'primary'} className={"mb-3"}>+ Create Fund</Button>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Create Fund</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreateFundForm closeModal={closeModal} fund={fund}/>
      </Modal.Body>
    </Modal>
  </>;
};

export default CreateFund;
