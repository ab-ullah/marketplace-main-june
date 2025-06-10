import React, {FunctionComponent} from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Heading} from "../../presentational/Heading";
import {TopBanner} from "../../presentational/TopBanner";
import {SubHeading} from "../../presentational/SubHeading";
import Container from "react-bootstrap/Container";
import CreateFundForm from "../Funds/components/CreateFund/CreateFundForm";


interface CreateFundProps {
}


const CreateFund: FunctionComponent<CreateFundProps> = () => {
  return <Container fluid className={'page-container'}>
    <Row>
      <TopBanner md={12}>
        <Row>
          <Col md={12}>
            <Heading>Admin Console</Heading>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <SubHeading>Step 1: Add a Fund</SubHeading>
          </Col>
        </Row>
      </TopBanner>
    </Row>
    <Row>
      <Col md={12}>
        <CreateFundForm closeModal={() => {
        }}/>
      </Col>
    </Row>
  </Container>
};

export default CreateFund;
