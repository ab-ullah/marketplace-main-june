import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import API from "../../../../api";


const NameDiv = styled.div`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  margin-right: 16px;
  line-height: 24px;
  color: #2E86DE;
  display: inline-block;
  cursor: pointer;
`

const ExtensionSize = styled.div`
  font-family: Quicksand;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  color: #B0BEC5;
  display: inline-block;

`


interface DocumentInfoProps {
  documentId: string;
  name: string;
  extension: string;
}


const DocumentInfo: FunctionComponent<DocumentInfoProps> = ({name, extension, documentId}) => {
  const handleDownload = async () => {
    await API.downloadDocument(documentId, name)
  }

  return <>
    <NameDiv onClick={handleDownload}>{name}</NameDiv>
    <ExtensionSize>{`${extension ? extension.toUpperCase() : ''}`}</ExtensionSize>
  </>
};

export default DocumentInfo;
