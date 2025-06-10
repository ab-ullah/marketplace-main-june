import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";

const FullWidthDiv = styled.div`
  width: 100%;
  text-align: center;
`

const QuestionsHeading = styled(FullWidthDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: bold;
  font-size: 40px;
  line-height: 60px;
  color: #020203;
`

const ContactHeading = styled(FullWidthDiv)`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
  margin-top: 22px;
`

const Email = styled(FullWidthDiv)`
  margin-top: 22px;

  a {
    font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 32px;
    line-height: 38px;
    color: #2E86DE !important;
    text-decoration: none;
  }

`

const ContactCol = styled(Col)<{ whiteBg: boolean | undefined }>`
  padding: 90px 0;
  background: ${props => props.whiteBg ? '#FFFFFF' : '#ECEFF1'};
`

interface ContactInfoProps {
  email: string;
  whiteBg?: boolean;
}


const ContactInfo: FunctionComponent<ContactInfoProps> = ({email, whiteBg}) => {

  return <Row>
    <ContactCol md={12} whiteBg={whiteBg}>
      <QuestionsHeading>Program Questions?</QuestionsHeading>
      <ContactHeading>Contact support: </ContactHeading>
      <Email>
        <a href={`mailto:${email}`}>{email}</a>
      </Email>
    </ContactCol>
  </Row>
};

export default ContactInfo;
