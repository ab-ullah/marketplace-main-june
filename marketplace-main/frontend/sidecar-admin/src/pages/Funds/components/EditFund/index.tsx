import React, {FunctionComponent, useState} from 'react';
import CreateFundForm from "../CreateFund/CreateFundForm";
import Modal from "react-bootstrap/Modal";
import EditIcon from '@material-ui/icons/Settings';
import {IFund} from "../../interfaces";


interface CreateFundProps {
  fund?: IFund
}


const EditFund: FunctionComponent<CreateFundProps> = ({fund}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => setShowModal(false);

  return <>
    <EditIcon onClick={() => setShowModal(true)} className={'cursor-pointer'} style={{fill: '#2E86DE'}}/>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Fund</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreateFundForm closeModal={closeModal} fund={fund}/>
      </Modal.Body>
    </Modal>
  </>;
};

export default EditFund;
