import { get } from "lodash";
import React, { FunctionComponent, memo, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import API from '../../api/backendApi'
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectKYCRecord } from "../../pages/KnowYourCustomer/selectors";
import { fetchCommentsByApplicationId, fetchCommentsByKycRecordId } from "../../pages/KnowYourCustomer/thunks";

interface ReplyModalProps {
    title: string, 
    showModal: boolean, 
    handleClose: () => void
}

const ReplyModal: FunctionComponent<ReplyModalProps> = ({
  title, 
  showModal, 
  handleClose
}) => {
    const dispatch = useAppDispatch()
    const {replyModal, applicationRecord} = useAppSelector(selectKYCRecord)
    const [message, setMessage] = useState('')

    useEffect(() => {
      setMessage('')
    }, [showModal])


    const handleSubmit = async () =>  {
        await API.createReply(get(replyModal, 'comment.id'), {
            text: message
        })
        handleClose()
        if(applicationRecord){
            dispatch(fetchCommentsByApplicationId(applicationRecord.id))
            dispatch(fetchCommentsByKycRecordId(applicationRecord.kyc_record.id))
        }
        
    }

  return (
    <Modal size={"lg"} show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
            <Form.Group>
                <Form.Label>
                    Reply
                </Form.Label>
                <Form.Control
                    placeholder="Enter your reply"
                    name="reply"
                    as="textarea"
                    value={message}
                    onChange={(e: any) => {
                        setMessage(e.target.value)
                    }}
                />
            </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default memo(ReplyModal);
