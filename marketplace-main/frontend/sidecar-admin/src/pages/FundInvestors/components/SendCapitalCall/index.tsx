import React, {FunctionComponent, useState} from 'react';
import CreateCapitalCallForm from "./CreateCapitalCallForm";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {IFormDetails} from "./interfaces";
import ReviewCapitalCall from "./ReviewCapitalCall";
import API from "../../../../api";
import {IFundDetail} from "../../../../interfaces/fundDetails";


interface CreateCapitalCallProps {
  fund: IFundDetail;
}


const CreateCapitalCall: FunctionComponent<CreateCapitalCallProps> = ({fund}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [callDetails, setCallDetails] = useState<IFormDetails | null>(null);

  const submitCapitalCall = async () => {
    if (!callDetails) return
    const payload = {
      call_amount: callDetails.callAmount,
      due_date: callDetails.dueDate,
      fund: fund.id
    }
    await API.createCapitalCall(payload)
    setShowModal(false)
  }

  return <>
    <Button onClick={() => setShowModal(true)} variant={'outline-primary'} className={"mb-3"}>Send Capital Call</Button>
    <Modal size={'lg'} show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Capital Call</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!callDetails && <CreateCapitalCallForm setCallDetails={setCallDetails} fund={fund}/>}
        {callDetails && <ReviewCapitalCall
          callAmount={callDetails.callAmount}
          setCallDetails={setCallDetails}
          submitCapitalCall={submitCapitalCall}
        />}
      </Modal.Body>
    </Modal>
  </>;
};

export default CreateCapitalCall;
