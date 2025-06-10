import React, {FunctionComponent} from 'react';
import Container from "react-bootstrap/Container";
import UploadDocumentsForm from "./components";
import {useParams} from "react-router-dom";


interface UploadDocumentsProps {
}


const UploadDocuments: FunctionComponent<UploadDocumentsProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();

  return <Container className="page-container">
    <UploadDocumentsForm externalId={externalId}/>
  </Container>
};

export default UploadDocuments;
