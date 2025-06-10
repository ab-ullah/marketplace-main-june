import React, {FunctionComponent, useState} from 'react';
import API from '../../../../api';
import {ButtonsContainer, CancelButton, Label, MessageInput, Modal, SendButton} from './styles';
import {ICommentPayload} from "../../../../interfaces/comments/applicationComments";
import {fetchCommentsByApplicationId, fetchCommentsByKycRecordId} from "../../thunks";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectApplicationInfo} from "../../selectors";
import {useParams} from "react-router-dom";
import {fetchTaskDetail} from "../../../TaskReview/thunks";

interface Props {
  show: boolean;
  onHide: () => void;
  fieldValue: string | number | null;
  kycRecordId?: number;
  applicationId?: number;
  commentFor: number;
  module: number;
  moduleId: number;
  questionIdentifier: string;
  documentIdentifier?: string;
  commentLabel?: string | null;
}

const RequestModal: FunctionComponent<Props> = ({
                                                  show,
                                                  onHide,
                                                  fieldValue,
                                                  kycRecordId,
                                                  applicationId,
                                                  commentFor,
                                                  module,
                                                  moduleId,
                                                  questionIdentifier,
                                                  documentIdentifier,
                                                  commentLabel
                                                }) => {
  const [message, setMessage] = useState('');
  const dispatch = useAppDispatch()
  const applicationInfo = useAppSelector(selectApplicationInfo);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value);
  const {taskId} = useParams<{ taskId: string }>();

  if (!applicationInfo) return <></>

  const flagQuestion = async () => {
    const payload = {
      comment_for: commentFor,
      module: module,
      module_id: moduleId,
      question_identifier: questionIdentifier,
      text: message,
      comment_label: commentLabel
    } as ICommentPayload;
    if (documentIdentifier) payload.document_identifier = documentIdentifier
    if (applicationId) payload.application = applicationId
    if (kycRecordId) payload.kyc_record = kycRecordId
    await API.createComment(
      message,
      payload,
      applicationInfo.id
    );
    if (applicationId) dispatch(fetchCommentsByApplicationId(applicationId));
    if (kycRecordId) dispatch(fetchCommentsByKycRecordId(kycRecordId));
    if (taskId) dispatch(fetchTaskDetail(taskId))
    onHide();
  };


  return <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Create Requests</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Label>
        Field
      </Label>
      <div>
        {fieldValue}
      </div>
      <Label>
        Message
      </Label>
      <MessageInput value={message} onChange={handleChange}/>
      <ButtonsContainer>
        <CancelButton onClick={onHide}>
          Cancel
        </CancelButton>
        <SendButton onClick={flagQuestion}>
          Send
        </SendButton>
      </ButtonsContainer>
    </Modal.Body>
  </Modal>
}

export default RequestModal;