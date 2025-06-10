import { FunctionComponent, useCallback, useEffect, useState } from "react";
// import size from "lodash/size";
// import get from "lodash/get";
// import { ErrorMessage } from "formik";
// import Tooltip from "@material-ui/core/Tooltip";
// import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
// import IconButton from "@material-ui/core/IconButton";
import LaunchIcon from "@material-ui/icons/Launch";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
// import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import Button from "react-bootstrap/Button";
import { DocumentUploadContainer as Container } from "../../../../presentational/DocumentUploadZone";
import ProgressBar from "../../../../presentational/ProgressBar";
import { map } from "lodash";

const DocumentUploadContainer = styled<any>(Container)`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d5cbcb;
  margin: 0;
  ${({ hasError }: any) =>
    hasError !== "" &&
    `
    background: #FCEEEA;
    border: 1px solid #F42222;
    .error{
      color: #F42222 !important;
    }
    button {
      background-color: transparent !important;
      border: 1px solid #2E86DE !important;
    }
  `}
`;

const LabelCol = styled(Col)`
  font-size: 15px !important;
  font-weight: 700 !important;
  line-height: 21px;
  padding-bottom: 6px;
`;

const FileDetail = styled.div`
  display: inline-block;
  color: #020203;
  svg {
    height: 16px;
    width: auto;
  }
  .trash-icon {
    fill: #f00;
    cursor: pointer;
  }
`;

// const DownloadLabel = styled(Link)`
//   color: #2e86de !important;
//   font-size: 16px !important;
//   font-weight: 500 !important;
//   text-decoration: underline !important;
//   button {
//     display: inline-block;
//   }
//   svg {
//     fill: #b0bec5;
//     height: 18px;
//     width: auto;
//   }
// `;

interface DocumentDropZoneProps {
  isUploading: boolean;
  title: string;
  multi?: boolean;
  allowedFormats: string[];
  currentFiles?:any[]
  onFilesSelect: (fileData: any) => void;
  onDelete?: () => void;
}

const DocumentDropZone: FunctionComponent<DocumentDropZoneProps> = ({
  title,
  multi,
  allowedFormats,
  currentFiles,
  isUploading,
  onFilesSelect,
  onDelete,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<any>([]);
  const handleDelete = (e: any, name: string,key:string) => {
    e.stopPropagation();
    let filteredFiles = uploadedFiles.filter(
      (file: any) => file[key] !== name
    );

    setUploadedFiles(filteredFiles);
    if (onDelete) onDelete();
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if(!multi){
        setUploadedFiles(acceptedFiles)
        onFilesSelect(acceptedFiles)
      }
      else{
      acceptedFiles.map((acceptedFile: any) => onFilesSelect(acceptedFile));
      setUploadedFiles((prev: any) => [...prev, ...acceptedFiles]);}
    },
    []
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    multiple: !!multi,
    accept: allowedFormats.join(","),
  });

  const formatCurrectFiles=(files:any)=>{
    return files.map((file:any)=>file.document)
  }

  useEffect(()=>{
    onFilesSelect(uploadedFiles)
  },[uploadedFiles])

  useEffect(()=>{
    if(currentFiles){
    setUploadedFiles([])}
  },[currentFiles])

  return (
    <Row className={"mt-2"}>
      <LabelCol md="12" className="field-label">
        {title}
      </LabelCol>
      <Col md="12">
        <DocumentUploadContainer
          hasError=""
          {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
        >
          <input {...getInputProps()} />
          {
            <>
              {map([...formatCurrectFiles(currentFiles||[]),...uploadedFiles], (file) => (
                <FileDetail>
                  <LaunchIcon /> {file.path || file.title}
                  {file.path &&
                  <TrashIcon
                    className="trash-icon"
                    onClick={(e) => handleDelete(e, (file.path || file.title),file.path?'path':'title')}
                  />}
                </FileDetail>
              ))}
              <>
                <p>Drag and drop files here, or select on your device</p>
                <Button className={"select-button"}>Select</Button>
              </>
            </>
          }
          {uploadedFiles ? <ProgressBar isLoading={isUploading} /> : <></>}
        </DocumentUploadContainer>
      </Col>
    </Row>
  );
};

export default DocumentDropZone;
