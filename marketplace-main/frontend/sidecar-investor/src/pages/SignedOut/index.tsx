import React, {FunctionComponent} from 'react';
import logo from '../../assets/images/navable-logo.png';
import LoginButton from "../../components/auth/LoginButton";
import {ContainerDiv, ImageDiv, SignedOutFooter, WelcomeTextDiv} from "./styles";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Nav} from "react-bootstrap";


interface SignedOutProps {

}


const SignedOut: FunctionComponent<SignedOutProps> = () => {


  return <>
    <ContainerDiv>
      <ImageDiv><img src={logo} alt="" /></ImageDiv>
      <WelcomeTextDiv>Welcome to Navable</WelcomeTextDiv>
      <LoginButton/>
    </ContainerDiv>
    <SignedOutFooter>
      <Row>
        <Col md={{offset: 3, span: 6}} sm={12} xs={12}>
          <Nav defaultActiveKey="/home" as="ul">
            <Nav.Item as="li">
              <Nav.Link href='https://support.hellosidecar.com' target='_blank'>Help Center</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link href='https://www.hellosidecar.com/policies/terms-of-service' target='_blank'>Terms of
                Use</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link href='https://www.hellosidecar.com/policies/privacy-policy' target='_blank'>Privacy
                Policy</Nav.Link>
            </Nav.Item>
            <Nav.Item as="li">
              <Nav.Link href="mailto:support@hellosidecar.com">Contact Us</Nav.Link>
            </Nav.Item>
          </Nav>
          <p className="m-0">By using this website, you understand the information being presented is provided for
            informational purposes only and agree to our <a
              href="https://www.hellosidecar.com/policies/terms-of-service" target='_blank' rel="noreferrer">Terms of Use</a> and <a
              href="https://www.hellosidecar.com/policies/privacy-policy" target='_blank' rel="noreferrer">Privacy Policy</a>. Sidecar Financial relies
            on information from various sources believed to be reliable, including partners and third parties, but
            cannot guarantee the accuracy and completeness of that information. Nothing in this website should be
            construed as an offer, recommendation, or solicitation to buy or sell any security. Additionally, Sidecar
            Financial does not provide tax advice and investors are encouraged to consult with their personal tax
            advisors.</p>
          <p className={'mt-4 copyright-text'}>© 2023 Sidecar Financial Inc. All rights reserved.</p>
        </Col>
        <Col className="d-none d-lg-block">&nbsp;</Col>
      </Row>
    </SignedOutFooter>
  </>

};

export default SignedOut;
