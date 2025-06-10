import React, {FunctionComponent, useState} from 'react';

import Modal from "react-bootstrap/Modal";
import {ISelectOption} from "../../../../interfaces/form";
import NavableLoader from "../../../../components/NavableLoader";
import UploadDocument from "./UploadDocument";
import Button from "react-bootstrap/Button";


interface AddDocumentButtonProps {
  onSave: (payload: any) => void;
  options: ISelectOption[]
}


const AddDocumentButton: FunctionComponent<AddDocumentButtonProps> = ({onSave, options}) => {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const closeModal = () => setShowModal(false)

  const handleSave = async (payload: any) => {
    setLoading(true)
    await onSave(payload)
    setLoading(false)
    setShowModal(false)
  }

  if (loading) return <NavableLoader/>
  if (!options) return <></>

  return <>
    <Button
      onClick={() => setShowModal(true)}
      variant={'primary'}
      className={'float-end'}
    >
      Add Document
    </Button>

    <Modal size={'lg'} show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Add Document</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <UploadDocument
          onSave={handleSave}
          onCancel={closeModal}
          options={options}
        />
      </Modal.Body>
    </Modal>
  </>
};

export default AddDocumentButton;
