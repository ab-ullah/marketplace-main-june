import React, {FunctionComponent} from 'react'
import documentIcon from "../../assets/images/document-icon.svg";
import deleteIcon from "../../assets/images/delete-icon.svg";
import styled from "styled-components";
import {IDocument} from "../../interfaces/FundMarketingPage/fundMarketingPage";
import API from "../../api";


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


interface DocumentIconProps {
  documentInfo: IDocument,
  onDelete: () => void
}


const DocumentIcon: FunctionComponent<DocumentIconProps> = ({documentInfo, onDelete}) => {
  const downloadDocument = async () => {
    await API.downloadDocument(documentInfo.document_id, documentInfo.document_name)
  }

  return (
    <ImageIconDiv className={'mt-2'}>
      <img className={'me-3'} src={documentIcon} alt="document-icon"/>
      <span onClick={downloadDocument}>{documentInfo.document_name}</span>
      <img className={'ms-3 deleteImg'} src={deleteIcon} alt={'delete'} onClick={onDelete}/>
    </ImageIconDiv>
  )
}

export default DocumentIcon;