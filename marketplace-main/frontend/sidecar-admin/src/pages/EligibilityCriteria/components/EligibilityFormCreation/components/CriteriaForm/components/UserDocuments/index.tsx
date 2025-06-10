import React, {FunctionComponent} from 'react';
import {ICriteriaBlock} from "../../../../../../../../interfaces/EligibilityCriteria/criteria";
import Button from "react-bootstrap/Button";
import {DocumentUploadContainer} from "../../../../../../../../presentational/DocumentUploadZone";


interface UserDocumentsProps {
  criteriaBlock: ICriteriaBlock
}


const UserDocuments: FunctionComponent<UserDocumentsProps> = ({criteriaBlock}) => {
  return <div>
    <h4>Supporting Documentation</h4>
    <p className={'note-text'}>
      This is a generic block for uploading documents that support a 
      prior question in the flow. The user will be able to upload documents 
      in this step. FYI- the uploading feature is not available for admins 
      or reviewers; just visible when investors are applying.
    </p>
    <DocumentUploadContainer>
      <p>Drag and drop files here, or select on your device</p>
      <Button className={'select-button'}>Select</Button>
    </DocumentUploadContainer>
  </div>
};

export default UserDocuments;
