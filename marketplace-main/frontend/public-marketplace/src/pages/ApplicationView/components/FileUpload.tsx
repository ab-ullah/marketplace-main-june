import React, { FunctionComponent, useEffect, useState } from 'react';
import { RecordDocument } from '../../KnowYourCustomer/interfaces';
import { DropzoneArea } from 'material-ui-dropzone'
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { FileAlreadyAdded, FileChooserButton, InnerFieldContainer, SelectButton } from '../../KnowYourCustomer/styles';
import { useField } from '../../KnowYourCustomer/hooks';
import FilePreviewModal from '../../KnowYourCustomer/components/FilePreview'
import { MAX_FILE_SIZE } from './constants';

interface FileUploadProps {
    request: {
        document_name: string;
        document_description: string;
        uuid: string;
    },
    uploadedDocuments: any;
    onDelete: (document_id: number) => void
}

const FileUpload: FunctionComponent<FileUploadProps> = ({ request, uploadedDocuments, onDelete }) => {

const { field, helpers } = useField(request.uuid, 'file_upload');
const [isAddmoreFile, setIsAddMoreFiles] = useState(false);

const filesLimit: number = 5;
const file_types: string[] = ['image/*', 'application/pdf', 'application/msword']

useEffect(() => {
    if(isAddmoreFile && field && field.value?.pendingUploads.length !== 0) 
    setIsAddMoreFiles(false)
  }, [field, uploadedDocuments, isAddmoreFile])

 const onChange = (files: any) => {
     const newValue = Object.assign({}, field.value, { pendingUploads: files });
     helpers.setValue(newValue);
 }
 const totalFiles = uploadedDocuments.length + (field.value as RecordDocument).pendingUploads.length;
  return <InnerFieldContainer >
    <Row className={'mt-2'}>
      <Col>
      {
          uploadedDocuments.map((document: { document: { title: string; document_id: string; }; id: string; }) => 
           <FileAlreadyAdded>
                <FilePreviewModal
            title={document.document.title}
            questionId={document.id}
            documentName={document.document.title}
            documentId={document.document.document_id}
          />
          <DeleteOutlineIcon htmlColor='#F42222' onClick={() => onDelete(parseInt(document.id))} />
           </FileAlreadyAdded>
            )
      }
      </Col>
      </Row>
      <Row>
      {
          ((uploadedDocuments.length === 0 || field.value?.pendingUploads.length > 0) || isAddmoreFile) && <DropzoneArea
            acceptedFiles={file_types}
            dropzoneText={'Drag and drop your files here or click to upload'}
            filesLimit={filesLimit ? filesLimit - totalFiles : filesLimit}
            maxFileSize={MAX_FILE_SIZE}
            onChange={onChange}
            showPreviewsInDropzone={true}
            showAlerts={true}
            clearOnUnmount={true}
            Icon={Icon as any}
          />
      }
      </Row>
      <Row>
      {
          field.value?.pendingUploads.length === 0 && uploadedDocuments.length > 0 && 
          <FileChooserButton
            onClick={() => setIsAddMoreFiles(true)}
          >
          Choose file for upload
      </FileChooserButton>
      }
      </Row>
  </InnerFieldContainer>
}

const Icon = () => <SelectButton>Select</SelectButton>;

export default FileUpload;