import React, {FunctionComponent, useEffect} from 'react';
import Container from "react-bootstrap/Container";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchFund} from "./thunks";
import {selectFund} from "./selectors";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FundDemandSummary from "./components/DemandSummary";
import PendingOrders from "./components/PendingOrders";
import {setFund} from "./fundDemandSlice";


interface FundDemandProps {
}


const FundDemand: FunctionComponent<FundDemandProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch();
  const fund = useAppSelector(selectFund);

  useEffect(() => {
    dispatch(fetchFund(externalId));
    return () => {
      dispatch(setFund(null));
    }
  }, [])

  if (!fund) return <></>

  return <Container className="page-container">
    <Row>
      <Col md={12}>
        <h4>{`${fund.name} - Demand`}</h4>
      </Col>
    </Row>
    <Row>
      <Col md={3} className={'mt-3'}>
        <FundDemandSummary fund={fund}/>
      </Col>
    </Row>
    <Row>
      <Col md={12} className={'mt-3'}>
        <PendingOrders fund={fund}/>
      </Col>
    </Row>
  </Container>
};

export default FundDemand;
