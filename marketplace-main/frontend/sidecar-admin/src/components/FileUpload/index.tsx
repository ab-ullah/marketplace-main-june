import React, {FunctionComponent, useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import Button from "react-bootstrap/Button";
import {DocumentUploadContainer} from "../../presentational/DocumentUploadZone";


interface DocumentDropZoneProps {
  onFileSelect: (fileData: any) => void;
  singleFileOnly?: boolean;
  disabled?: boolean;
}


const DocumentDropZone: FunctionComponent<DocumentDropZoneProps> = ({onFileSelect, singleFileOnly, disabled}) => {
  const [files, setFiles] = useState([])
  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.map((acceptedFile: any) => onFileSelect(acceptedFile))
    // @ts-ignore
    setFiles([...files, ...acceptedFiles])
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({onDrop, multiple: !singleFileOnly, disabled});

  return (
    <div className="container">
      <DocumentUploadContainer {...getRootProps({isDragActive, isDragAccept, isDragReject})} className={'upload-container'}>
        <input {...getInputProps()} />
        <p>Drag and drop files here, or select on your device</p>
        <Button className={'select-button'} disabled={disabled}>Select</Button>
      </DocumentUploadContainer>
    </div>
  )
}

DocumentDropZone.defaultProps = {
  disabled: false
}

export default DocumentDropZone;