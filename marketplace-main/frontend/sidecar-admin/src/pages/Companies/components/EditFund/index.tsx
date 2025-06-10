import React, {FunctionComponent, useState} from 'react';
import Modal from "react-bootstrap/Modal";
import EditIcon from '@material-ui/icons/Edit';
import {ICompanyToken} from "../../../../interfaces/company";
import CreateCompanyTokenForm from "../CreateToken/CreateTokenForm";


interface EditCompanyTokenProps {
  companyToken?: ICompanyToken
}


const EditCompanyToken: FunctionComponent<EditCompanyTokenProps> = ({companyToken}) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const closeModal = () => setShowModal(false);

  return <>
    <EditIcon onClick={() => setShowModal(true)} className={'cursor-pointer'}/>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Company Token</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CreateCompanyTokenForm closeModal={closeModal} companyToken={companyToken}/>
      </Modal.Body>
    </Modal>
  </>;
};

export default EditCompanyToken;
