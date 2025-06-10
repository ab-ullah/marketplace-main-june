import React, {FunctionComponent} from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Nav} from "react-bootstrap";
import styled from "styled-components";
import Logo from "../../assets/images/navable-icon.png";
import { darkenColor } from "../Button/styles";

const StyledFooter = styled.footer`
  background: ${props => darkenColor(props.theme.palette.primary,40)};
  color: white;
  padding: ${props => `${props.theme.baseLine * 2}px`};
  border-top-right-radius: 30px;
  border-top-left-radius: 30px;

  .App-logo {
    width: 35px;
    height: 35px;
  }

  .nav {
    margin: ${props => `${props.theme.baseLine}px 0 ${props.theme.baseLine * 1.5}px`};

    .nav-item {

      a {
        color: white;
        font-family: 'Quicksand Bold';
        text-decoration: underline;
      }

      &:first-child {

        a {
          padding-left: 0;
        }
      }
    }
  }

  p {
    margin-bottom: ${props => `${props.theme.baseLine}px`};
    
    a {
      color: white;
      font-family: 'Quicksand Bold';
      text-decoration: underline;
    }
    
  }

  @media screen and (max-width: 1199px) {
    .nav {
      display: block;

      .nav-item {
        a {
          padding-left: 0;
        }
      }
    }
  }
`

interface FooterProps {

}

export const LoggedInFooter: FunctionComponent<FooterProps> = () => {
  return <StyledFooter>
    <Row>
      <Col xs={12}>
        <img src={Logo} className="App-logo" alt="logo"/>
        <Nav defaultActiveKey="/home" as="ul">
          <Nav.Item as="li">
            <Nav.Link href='https://support.hellosidecar.com' target='_blank'>Help Center</Nav.Link>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link href='https://www.hellosidecar.com/policies/terms-of-service' target='_blank'>Terms of Use</Nav.Link>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link href='https://www.hellosidecar.com/policies/cookie-policy' target='_blank'>Cookie Policy</Nav.Link>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link href='https://www.hellosidecar.com/policies/privacy-policy' target='_blank'>Privacy Policy</Nav.Link>
          </Nav.Item>
          <Nav.Item as="li">
            <Nav.Link href="mailto:support@hellosidecar.com">Contact Us</Nav.Link>
          </Nav.Item>
        </Nav>
        <p className="m-0">By using this website, you understand the information being presented is provided for informational purposes only and agree to our <a href="https://www.hellosidecar.com/policies/terms-of-service" target='_blank' rel="noreferrer">Terms of Use</a> and <a href="https://www.hellosidecar.com/policies/privacy-policy" target='_blank' rel="noreferrer">Privacy Policy</a>. Sidecar Financial relies on information from various sources believed to be reliable, including partners and third parties, but cannot guarantee the accuracy and completeness of that information. Nothing in this website should be construed as an offer, recommendation, or solicitation to buy or sell any security. Additionally, Sidecar Financial does not provide tax advice and investors are encouraged to consult with their personal tax advisors.</p>
        <p className={"mt-5"}>© 2023 Sidecar Financial Inc. All rights reserved.</p>
      </Col>
      <Col className="d-none d-lg-block">&nbsp;</Col>
    </Row>
  </StyledFooter>
}

export default LoggedInFooter;