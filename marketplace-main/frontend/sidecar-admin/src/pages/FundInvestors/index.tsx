import React, {FunctionComponent, useEffect} from 'react';
import Container from "react-bootstrap/Container";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchFund} from "./thunks";
import {selectFund} from "./selectors";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {setFund} from "./fundInvestorsSlice";
import Investors from "./components/Investors";
import CreateCapitalCall from "./components/SendCapitalCall";


interface FundInvestorsProps {
}


const FundInvestors: FunctionComponent<FundInvestorsProps> = () => {
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
      <Col md={8}>
        <h4>{`${fund.name} - Investors`}</h4>
      </Col>
      <Col md={4}>
        <CreateCapitalCall fund={fund}/>
      </Col>
    </Row>
    <Row>
      <Col md={12} className={'mt-3'}>
        <Investors fund={fund}/>
      </Col>
    </Row>
  </Container>
};

export default FundInvestors;
