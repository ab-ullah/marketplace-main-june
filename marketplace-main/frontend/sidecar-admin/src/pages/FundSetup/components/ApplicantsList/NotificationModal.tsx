import React, { FunctionComponent, useState } from "react";
import { Modal } from "react-bootstrap";
import styled from "styled-components";
import {
  ButtonsContainer,
  CancelButton,
  Label,
  MessageInput,
  SendButton,
} from "../../../KnowYourCustomer/components/RequestModal/styles";

interface INotificationModalProps {
  isShow: boolean;
  comment: string;
  onSubmit: () => void;
  onHide: () => void;
  onChange: (value: string) => void;
}

const ModalBodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const NotificationModal: FunctionComponent<INotificationModalProps> = ({
  isShow,
  comment,
  onChange,
  onSubmit,
  onHide,
}) => {
  const [notify,setNotify] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    onChange(e.target.value);

  return (
    <Modal show={isShow} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Save Edits?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ModalBodyWrapper>
          <div className="d-flex">
          <Label>Notify Investor?</Label>
          <input
            type="checkbox"
            checked={notify}
            onChange={(e: any) => setNotify(prev=>!prev)}
            className="mx-3"
          />
          </div>
          <MessageInput value={comment} onChange={handleChange} disabled={!notify}/>
        </ModalBodyWrapper>
        <ButtonsContainer>
          <CancelButton onClick={onHide}>Cancel</CancelButton>
          <SendButton onClick={onSubmit}>Save</SendButton>
        </ButtonsContainer>
      </Modal.Body>
    </Modal>
  );
};

export default NotificationModal;
