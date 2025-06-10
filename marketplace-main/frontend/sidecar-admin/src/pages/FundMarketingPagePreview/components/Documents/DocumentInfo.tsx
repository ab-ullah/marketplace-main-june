import React, {FunctionComponent} from 'react';
import API from "../../../../api";
import {ExtensionSize, NameDiv} from "./styles";


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
