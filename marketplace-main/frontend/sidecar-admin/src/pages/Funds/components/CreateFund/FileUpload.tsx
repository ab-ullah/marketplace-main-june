import { FunctionComponent, useCallback, useState } from "react";
import size from "lodash/size";
import get from "lodash/get";
import { ErrorMessage } from "formik";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import IconButton from "@material-ui/core/IconButton";
import LaunchIcon from "@material-ui/icons/Launch";
import TrashIcon from "@material-ui/icons/DeleteOutlined";
import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import Button from "react-bootstrap/Button";
import { DocumentUploadContainer as Container } from "../../../../presentational/DocumentUploadZone";
import ProgressBar from "../../../../presentational/ProgressBar";

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

const DownloadLabel = styled(Link)`
  color: #2e86de !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  text-decoration: underline !important;
  button {
    display: inline-block;
  }
  svg {
    fill: #b0bec5;
    height: 18px;
    width: auto;
  }
`;

interface DocumentDropZoneProps {
  isUploading: boolean;
  title: string;
  name: string;
  error: string;
  onFileSelect: (fileData: any) => void;
  onDelete?: () => void;
}

const DocumentDropZone: FunctionComponent<DocumentDropZoneProps> = ({
  title,
  name,
  error,
  isUploading,
  onFileSelect,
  onDelete,
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const handleDelete = (e: any) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (onDelete) onDelete();
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.map((acceptedFile: any) => onFileSelect(acceptedFile));
      setUploadedFile(acceptedFiles);
    },
    [onFileSelect, setUploadedFile]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept:
      ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
  });

  const userInfo = localStorage.getItem('userInfo')
  let templatePath = '/assets/fund-invite-template.csv';
  if (userInfo){
    const userDetails = JSON.parse(userInfo);
    const useRiversideTemplate = get(userDetails, "use_riverside_template");
    if (useRiversideTemplate) {
      templatePath = '/assets/invite-template.csv'
    }
  }

  return (
    <Row className={"mt-2"}>
      <LabelCol md="12" className="field-label">
        {title}
      </LabelCol>
      <Col md="12">
        <DocumentUploadContainer
          hasError={error}
          {...getRootProps({ isDragActive, isDragAccept, isDragReject })}
        >
          <input {...getInputProps()} />
          {error ? (
            <>
              <p className="error">
                Can't upload {get(uploadedFile, "[0].path", "")}
              </p>
              <Button className={"select-button"} onClick={handleDelete}>
                Try to upload again
              </Button>
            </>
          ) : (
            <>
              {size(uploadedFile) > 0 ? (
                <FileDetail>
                  <LaunchIcon /> {get(uploadedFile, "[0].path", "")} - (
                  {get(uploadedFile, "[0].size", 0)} bytes)
                  <TrashIcon className="trash-icon" onClick={handleDelete} />
                </FileDetail>
              ) : (
                <>
                  <p>Drag and drop files here, or select on your device</p>
                  <Button className={"select-button"}>Select</Button>
                </>
              )}
            </>
          )}

          {uploadedFile ? (<ProgressBar isLoading={isUploading} />) : (<></>)}
        </DocumentUploadContainer>
      </Col>
      <Col md="12">
        <DownloadLabel
          to={templatePath}
          target="_blank"
          download
        >
          Download template{" "}
          <Tooltip
            title="Please download this template file, complete and upload as a CSV or Excel file. Do not change any headers."
            arrow
          >
            <IconButton aria-label="delete" style={{ display: "inline-block" }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </DownloadLabel>
        <ErrorMessage className="text-danger" name={name} component="div" />
      </Col>
    </Row>
  );
};

export default DocumentDropZone;
