import React, {FunctionComponent} from 'react';
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import TokensList from "./components/TokensList";
import CreateCompanyToken from "./components/CreateToken";
import Col from "react-bootstrap/Col";


interface CompanyTokensProps {
}


const CompanyTokens: FunctionComponent<CompanyTokensProps> = () => {
  return <Container fluid className={'page-container'}>
    <Row>
      <TokensList/>
    </Row>
    <Row>
      <Col>
        <CreateCompanyToken/>
      </Col>
    </Row>
  </Container>
};

export default CompanyTokens;
