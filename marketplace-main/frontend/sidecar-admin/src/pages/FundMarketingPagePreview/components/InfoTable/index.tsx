import React, {FunctionComponent} from 'react';
import {FundInformationParent, FundInformationTable, MainHeading, SubHeading} from "./styles";
import {IFundMarketingPageDetail} from "../../../../interfaces/FundMarketingPage/fundMarketingPage";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


interface FundInfoTableProps {
  previewFundPage: IFundMarketingPageDetail
}


const FundInfoTable: FunctionComponent<FundInfoTableProps> = ({previewFundPage}) => {

  return <FundInformationParent>
    <Row>
      <MainHeading md={12}>Fund Information</MainHeading>
    </Row>
    <Row>
      <SubHeading md={12}>Fund Facts</SubHeading>
    </Row>
    <Row>
      <Col md={12}>
        <FundInformationTable responsive="md">
          {previewFundPage.fund_facts.map((fundFact) => <tr>
              <td>{fundFact.title}</td>
              <td>{fundFact.data}</td>
            </tr>
          )}
        </FundInformationTable>
      </Col>
    </Row>
  </FundInformationParent>
};

export default FundInfoTable;
