import React, { FunctionComponent, useEffect, useState } from 'react';
import API from '../../../api';
import get from "lodash/get";
import map from "lodash/map";
import filter from "lodash/filter";
import size from "lodash/size";
import { FileUploadTypeData, KYCDocument } from "../../../interfaces/workflows"
import { isToolTipText } from "../../../components/ToolTip/interfaces";
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchKYCDocuments, fetchKYCParticipantsDocuments, fetchKYCRecord } from '../thunks';
import { selectKYCRecord } from '../selectors';
import FilePreviewModal from './FilePreview';
import { FieldComponent } from '../interfaces';
import { DropzoneArea } from 'material-ui-dropzone'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ToolTip from '../../../components/ToolTip';
import {DisabledButton, FileAlreadyAdded, FileChooserButton, InnerFieldContainer, SelectButton} from '../styles';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {ErrorMessage, useFormikContext} from 'formik';
import { useField } from '../hooks'
import { CommentsContext } from "../../ApplicationView";
import CommentWrapper from '../../../components/CommentWrapper';
import { MAX_FILE_SIZE } from '../../ApplicationView/Components/constants';
import { useGetApplicationStatusQuery } from '../../../api/rtkQuery/fundsApi';
import { useParams } from 'react-router-dom';
import {isApplicationPage} from "../../../utils/routes";

interface FileUploadProps extends FieldComponent {
}

const FileUpload: FunctionComponent<FileUploadProps> = ({ question, customOnBlur, disabled }) => {
  const { externalId } = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch();
  const formik = useFormikContext();
  const isSubmitting = formik?.isSubmitting;
  const [isAddmoreFile, setIsAddMoreFiles] = useState(false)
  const { data: applicationStatus } = useGetApplicationStatusQuery(externalId);
  const { recordUUID, comments } = useAppSelector(selectKYCRecord);
  const { field, helpers } = useField(question.id, question.type);
  const isApplicationLocked = applicationStatus?.is_locked || (applicationStatus?.application_view_editing_disabled && isApplicationPage());

  const data = question.data as FileUploadTypeData;
  const { file_types, filesLimit } = data;

  useEffect(() => {
    if(isAddmoreFile && field && field.value?.pendingUploads?.length !== 0)
    setIsAddMoreFiles(false)
  }, [field, isAddmoreFile])

  const handleChange = (files: File[]) => {
    const newValue = Object.assign({}, field.value, { pendingUploads: files });
    if (customOnBlur && newValue.pendingUploads.length > 0) {
      customOnBlur()
    }
    helpers.setValue(newValue);
  }

  const onFileDeletion = async (doc: KYCDocument) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      await API.deleteKYCDocument(doc.record_id, doc.document.document_id, externalId)
      // KYC answers are computed based on documents in current state
      // Therefore fetching documents first and then kyc record
      dispatch(fetchKYCParticipantsDocuments(doc.record_id));
      dispatch(fetchKYCDocuments(doc.record_id));
      dispatch(fetchKYCRecord(recordUUID!));
    }
  }

  const documentsInRecord = get(field.value, 'documentsInRecord', []);
  const pendingUploads = get(field.value, 'pendingUploads', []);

  const totalFiles = size(documentsInRecord) + size(pendingUploads);
  return <InnerFieldContainer >
    <CommentsContext.Consumer>
    {({recordId, callbackDocumentUpload}) => (
    <Row className={'mt-2'}>
      <Col md={4} className='field-label'>
        {question.label}
        {isToolTipText(question.helpText) && <ToolTip {...question.helpText} />}
      </Col>
      {(typeof question.helpText === "string") && <Col md={8} className='field-help-text'>
        <span>{question.helpText}</span>
      </Col>}
      <Col md={8}>
        {map(documentsInRecord, (file: KYCDocument) => {
          const docComments = filter(comments, (comment: any) => comment.document_identifier === file.document.document_id)
          return (<>
                    <FileAlreadyAdded key={file.document.document_id}>
                      <FilePreviewModal
                        title={question.label}
                        questionId={question.id}
                        documentName={file.document.title}
                        documentId={file.document.document_id}
                      />
                      {!isApplicationLocked && <DeleteOutlineIcon htmlColor='#F42222' onClick={() => onFileDeletion(file)} />}
                    </FileAlreadyAdded>
                    {map(docComments, (comment: any) => (<CommentWrapper key={comment.id} comment={comment}/>))}
                </>);
          })}
        {((size(documentsInRecord) === 0 || size(pendingUploads) > 0) || isAddmoreFile) && <DropzoneArea
          acceptedFiles={file_types}
          dropzoneText={isSubmitting ? '' : 'Drag and drop your files here or click to upload'}
          filesLimit={filesLimit ? filesLimit - totalFiles : filesLimit}
          maxFileSize={MAX_FILE_SIZE}
          dropzoneProps={{disabled: isSubmitting}}
          onChange={(files: File[]) => {
            handleChange(files);
            if(callbackDocumentUpload && recordId)
              callbackDocumentUpload({files, recordId, questionId: question.id });
          }}
          showPreviewsInDropzone={true}
          showAlerts={true}
          clearOnUnmount={true}
          Icon={isSubmitting ? DisabledIcon : Icon as any}
        />}
        {/*
          // TODO: implement add another file
        */}
        {((filesLimit === undefined || totalFiles < filesLimit) && size(pendingUploads) === 0 && size(documentsInRecord) > 0) &&
        <FileChooserButton
          onClick={() => setIsAddMoreFiles(true)}
          var='outlined'
        >
          Choose file for upload
        </FileChooserButton>}
        <ErrorMessage className={"text-danger"} name={question.id} component='div' />
      </Col>
    </Row>
    )}
    </CommentsContext.Consumer>
  </InnerFieldContainer >
}

const Icon = () => <SelectButton>Select</SelectButton>;
const DisabledIcon = () => <DisabledButton>Please wait while documents are processed ...</DisabledButton>;

export default FileUpload;