import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import {Button, Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import infoIconBlue from "../../assets/images/info-icon-blue.svg";
import {GLOSSARY_DEFINITION_HASH} from "../../constants/glossaryItemsHash";


const ParentDiv = styled.div`
  padding: 22px;
`

const Heading = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  color: #000000;
  text-align: left;
`

const Description = styled.div`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  color: #000000;
  text-align: left;
`


const InfoButton = styled(Button)`
  position: absolute;
  left: 80%;
  top: 8%;
`

interface GlossaryToolTipProps {
  heading: string;
  description: string;
}


export const StatToolTip: FunctionComponent<GlossaryToolTipProps> = ({heading, description}) => {
  return <OverlayTrigger
    placement="bottom"
    overlay={
      <Tooltip id="button-tooltip-2" arrowProps={{style: {'display': "none", 'height': '0px'}}}>
        <ParentDiv>
          <Heading>{heading}</Heading>
          <Description>{description}</Description>
        </ParentDiv>
      </Tooltip>
    }
  >
    {({ref, ...triggerHandler}) => (
      <InfoButton
        variant="clear"
        {...triggerHandler}
        className="d-inline-flex align-items-center info-icon"
      >
        <Image
          ref={ref}
          roundedCircle
          src={infoIconBlue}
          alt="info icon"
        />
      </InfoButton>
    )}
  </OverlayTrigger>
}

export default StatToolTip;
