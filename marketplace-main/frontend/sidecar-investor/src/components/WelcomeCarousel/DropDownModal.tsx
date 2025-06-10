import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import WelcomeCarousel from "./index";
import {SideCarModal} from "../../presentational/SideCarModal";
import { Dropdown } from 'react-bootstrap';


const DropDownWelcomeModal: FunctionComponent = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return <>
    <Dropdown.Item onClick={() => setShowModal(true)}>User Guide</Dropdown.Item>
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

export default DropDownWelcomeModal;
