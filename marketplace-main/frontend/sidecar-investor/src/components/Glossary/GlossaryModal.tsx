import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import Glossary from "./index";
import {SideCarModal} from "../../presentational/SideCarModal";


const GlossaryModal: FunctionComponent = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return <>
    <span onClick={() => setShowModal(true)}>Glossary of Terms</span>
    <SideCarModal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>DEFINITIONS</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Glossary/>
      </Modal.Body>
    </SideCarModal>
  </>;
};

export default GlossaryModal;
