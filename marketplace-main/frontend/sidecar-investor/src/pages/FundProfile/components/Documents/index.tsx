import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import {IFundWithProfile} from "../../../../interfaces/fundProfile";
import FundInfoTable from "../InfoTable";
import DocumentInfo from "./DocumentInfo";


const DocumentsParent = styled.div`
  padding: 10px 60px;
  margin-bottom: 40px;
`

const MainHeading = styled(Col)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`


interface RequestAllocationProps {
  fund: IFundWithProfile
}


const Documents: FunctionComponent<RequestAllocationProps> = ({fund}) => {
  const fundDocuments = fund.documents.map((document) => {
    return {label: <DocumentInfo name={document.title} extension={document.extension} documentId={document.document_id}/>}
  } )

  return <DocumentsParent>
    <Row>
      <MainHeading md={12}>Documents</MainHeading>
    </Row>
    <Row>
      <Col md={12}>
        <FundInfoTable fund={fund} mappings={fundDocuments}/>
      </Col>
    </Row>
  </DocumentsParent>
};

export default Documents;
