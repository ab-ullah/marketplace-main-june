import React, {FunctionComponent, useEffect} from 'react';


import Col from "react-bootstrap/Col";
import {selectCapitalCall} from "../../selectors";
import {getCapitalCall} from "../../thunks";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import FormattedCurrency from "../../../../utils/FormattedCurrency";
import styled from "styled-components";


const CapitalCallContainer = styled(Container)`
  padding: 10px;
`

interface ICapitalCallDetailProps {
  uuid: string
}


const CapitalCallDetail: FunctionComponent<ICapitalCallDetailProps> = ({uuid}) => {
  const dispatch = useAppDispatch();
  const capitalCall = useAppSelector(selectCapitalCall);

  useEffect(() => {
    dispatch(getCapitalCall(uuid))
  }, [])

  if (!capitalCall) return <></>

  return <CapitalCallContainer fluid>
    <Row className={'mt-1'}>
      <Col md={12}>
        <b>Amount due: </b> <FormattedCurrency value={capitalCall.call_amount} symbol={capitalCall.currency?.symbol}/>
      </Col>
    </Row>
    <Row className={'mt-1'}>
      <Col md={12}>
        <b>Investment: </b> {capitalCall.fund_name}
      </Col>
    </Row>
    <Row className={'mt-1'}>
      <Col md={12}>
        <b>Due Date: </b> All funds must be received by <b>{capitalCall.due_date}</b>
      </Col>
    </Row>
    <Row className={'mt-5'}>
      <Col md={6}>
        <b>Bank Name: </b>XYZ bank
      </Col>
      <Col md={6}>
        <b>Beneficiary Name: </b>Cayman LP
      </Col>
    </Row>
    <Row className={'mt-1'}>
      <Col md={6}>
        <b>ABA Routing Number: </b>123456789
      </Col>
      <Col md={6}>
        <b>Account Number: </b>123456789
      </Col>
    </Row>
    <Row className={'mt-1'}>
      <Col md={6}>
        <b>Bank Address: </b>1234 Smith Road Chicago, IL 60007
      </Col>
      <Col md={6}>
        <b>Account Type: </b>Checking
      </Col>
    </Row>
    <Row className={'mt-1'}>
      <Col md={6}>
      </Col>
      <Col md={6}>
        <b>Beneficiary Address: </b>1 N. Lasalle St. Chicago, IL 60602
      </Col>
    </Row>
  </CapitalCallContainer>
};

export default CapitalCallDetail;
