import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import {Button, Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import infoIconBlue from "../../assets/images/info-icon-blue.svg";


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
`

interface PublishedUnpublishedTooltipProps {
}


export const PublishedUnpublishedTooltip: FunctionComponent<PublishedUnpublishedTooltipProps> = () => {
  return <OverlayTrigger
    placement="bottom"
    overlay={
      <Tooltip id="button-tooltip-2" arrowProps={{style: {'display': "none", 'height': '0px'}}}>
        <ParentDiv>
          <Heading>Show Unpublished Funds</Heading>
            <Description>When this toggle is on, you will be able to see both published
                and unpublished funds, for the investor you are viewing</Description>
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

export default PublishedUnpublishedTooltip;
