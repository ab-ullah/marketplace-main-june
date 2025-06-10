import React, {FunctionComponent, useState} from 'react';
import ConfirmationModal from "../../../../presentational/ConfirmationModal";
import Button from "react-bootstrap/Button";
import {ColumnDiv} from "./styles";


interface DocumentActionProps {
  deleted: boolean,
  title: string,
  updateDocument: (payload: any) => void
}


const DocumentAction: FunctionComponent<DocumentActionProps> = ({deleted, title, updateDocument}) => {
  const [showModal, setShowModal] = useState(false)
  const deletedPayload = !deleted;
  const label = deleted ? 'Undelete' : 'Delete'
  const payload = {
    deleted: deletedPayload
  }
  return <>
    <ColumnDiv>
      <Button
        variant={deleted ? 'primary' : 'danger'}
        onClick={() => setShowModal(true)}
        style={{fontSize: '14px'}}
      >
        {label}
      </Button>
    </ColumnDiv>
    <ConfirmationModal
      show={showModal}
      msg={`Are you sure you want to ${label}: ${title}`}
      handleClose={() => setShowModal(false)}
      handleSubmit={() => updateDocument(payload)}
    />

  </>
};

export default DocumentAction;
