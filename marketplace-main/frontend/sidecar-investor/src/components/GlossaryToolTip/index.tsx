import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import {Button, Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import infoIconWhite from "../../assets/images/info-icon-white.svg";
import {GLOSSARY_DEFINITION_HASH} from "../../constants/glossaryItemsHash";


const ParentDiv = styled.div`
  padding: 22px;
`

export const Heading = styled.div`
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
const ColSpan = styled.span`
  position: relative;
`

const InfoButton = styled(Button)`
  position: absolute;
  bottom: -9px;
  left: 98%;
  padding-right: 0;
  padding-left: 7px;
`

interface GlossaryToolTipProps {
  header: string
  heading: string
  description: string
}


export const GlossaryToolTipHeader: FunctionComponent<GlossaryToolTipProps> = ({header, heading, description}) => {
  return (
    <ColSpan>
      {header}
      <OverlayTrigger
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
              src={infoIconWhite}
              alt="info icon"
            />
          </InfoButton>
        )}
      </OverlayTrigger>
    </ColSpan>
  )
}

export default GlossaryToolTipHeader;
