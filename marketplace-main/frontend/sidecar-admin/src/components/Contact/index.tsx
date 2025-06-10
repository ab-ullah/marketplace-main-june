import React, {FunctionComponent} from 'react';

import Row from "react-bootstrap/Row";
import styled from "styled-components";
import Col from "react-bootstrap/Col";
import {ContactHeading, Email, QuestionsHeading} from "./styles";



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
