import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import WelcomeCarousel from "./index";
import {SideCarModal} from "../../presentational/SideCarModal";


const WelcomeModal: FunctionComponent = () => {
  const [showModal, setShowModal] = useState<boolean>(true);

  return <>
    <SideCarModal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Welcome to Navable</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <WelcomeCarousel/>
      </Modal.Body>
    </SideCarModal>
  </>;
};

export default WelcomeModal;
