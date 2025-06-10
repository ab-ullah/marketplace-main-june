import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import DocumentInfo from "./DocumentInfo";
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import {FundInformationTable} from "../InfoTable/styles";


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


interface DocumentsProps {
  previewFundPage: IFundMarketingPageDetail
}


const Documents: FunctionComponent<DocumentsProps> = ({previewFundPage}) => {
  return <DocumentsParent>
    <Row>
      <MainHeading md={12}>Documents</MainHeading>
    </Row>
    <Row>
      <Col md={12}>
        <FundInformationTable responsive="md">
          {previewFundPage.fund_page_documents.map((document) => {
            return <tr>
              <td>
                <DocumentInfo
                  name={document.document_name}
                  extension={document.extension}
                  documentId={document.document_id}/>
              </td>
            </tr>
          })}
        </FundInformationTable>
      </Col>
    </Row>
  </DocumentsParent>
};

export default Documents;
