import React, {FunctionComponent} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {IFundInvestorDetail} from "../../../../interfaces/fundInvestorDetail";
import Col from "react-bootstrap/Col";


interface InfoHeaderProps {
  fundInvestorDetail: IFundInvestorDetail
}


const InfoHeader: FunctionComponent<InfoHeaderProps> = ({fundInvestorDetail}) => {

  return <Container>
    <Row>
      <Col md={4}>
        <b>Investment Name:</b> {fundInvestorDetail.fund_name}
      </Col>
      <Col md={4}>
        <b>Invested Since:</b> {fundInvestorDetail.created_at}
      </Col>
      <Col md={4}>
        <b>Currency:</b> {fundInvestorDetail.currency?.code}
      </Col>
    </Row>
    <Row>
      <Col md={4}>
        <b>Investor:</b> {fundInvestorDetail.investor_name}
      </Col>
      <Col md={4}>
        <b>Years Invested:</b> {fundInvestorDetail.years_invested}
      </Col>
      <Col md={4}>
        <b>Initial Leverage Ratio:</b> {fundInvestorDetail.initial_leverage_ratio}
      </Col>
    </Row>
  </Container>
};

export default InfoHeader;
