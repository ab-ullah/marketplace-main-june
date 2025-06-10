import React, {FunctionComponent, useState} from 'react';

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import CapitalCallDetail from "./index";
import {SideCarModal} from "../../../../presentational/SideCarModal";


interface CapitalCallModalProps {
  uuid: string;
}


const CapitalCallModal: FunctionComponent<CapitalCallModalProps> = ({uuid}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  console.log("UUID", uuid)

  return <>
    <Button onClick={() => setShowModal(true)} variant={'outline-primary'}>Review More</Button>
    <SideCarModal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Domestic Wire Transfer Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CapitalCallDetail uuid={uuid}/>
      </Modal.Body>
    </SideCarModal>
  </>;
};

export default CapitalCallModal;
