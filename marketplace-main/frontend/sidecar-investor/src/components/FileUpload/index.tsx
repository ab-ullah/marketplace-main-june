import React, {FunctionComponent, useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import Button from "react-bootstrap/Button";
import {DocumentUploadContainer} from "../../presentational/DocumentUploadZone";


interface DocumentDropZoneProps {
  onFileSelect: (fileData: any) => void
  singleFileOnly?: boolean
  isDisabled?: boolean;
}


const DocumentDropZone: FunctionComponent<DocumentDropZoneProps> = ({onFileSelect, singleFileOnly, isDisabled}) => {
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
  } = useDropzone({onDrop, disabled: isDisabled, multiple: !singleFileOnly});

  return (
    <div className="container">
      <DocumentUploadContainer {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
        <input {...getInputProps()} />
        <p>Drag and drop files here, or select on your device</p>
        <Button className={'select-button'}>Select</Button>
      </DocumentUploadContainer>
    </div>
  )
}

export default DocumentDropZone;