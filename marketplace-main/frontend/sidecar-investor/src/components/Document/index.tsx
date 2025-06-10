import React, {FunctionComponent} from 'react'
import documentIcon from "../../assets/images/document-icon.svg";
import deleteIcon from "../../assets/images/delete-icon.svg";
import styled from "styled-components";
import API from "../../api";
import {IDocument} from "../../interfaces/EligibilityCriteria/criteria";


const ImageIconDiv = styled.div`
  padding: 15px;

  span {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #000000;
    text-decoration: none;
    cursor: pointer;
  }

  .deleteImg {
    cursor: pointer;
  }
`


interface DocumentProps {
  documentInfo: IDocument
  postDelete: () => void
  isDisabled? :boolean;
}


const Document: FunctionComponent<DocumentProps> = ({documentInfo, postDelete, isDisabled}) => {
  const downloadDocument = async () => {
    await API.downloadDocument(documentInfo.document_id, documentInfo.document_name)
  }

  const deleteDocument = async () => {
    await API.deleteDocument(documentInfo.doc_id)
    postDelete();
  }

  return (
    <ImageIconDiv className={'mt-2'}>
      <img className={'me-3'} src={documentIcon} alt='document'/>
      <span onClick={downloadDocument}>{documentInfo.document_name}</span>
      {!isDisabled && <img className={'ms-3 deleteImg'} src={deleteIcon} alt={'delete'} onClick={deleteDocument}/>}
    </ImageIconDiv>
  )
}

export default Document;