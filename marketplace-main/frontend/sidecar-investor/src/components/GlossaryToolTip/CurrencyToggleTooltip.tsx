import React, {FunctionComponent} from 'react';
import styled from "styled-components";
import {Button, Image, OverlayTrigger, Tooltip} from "react-bootstrap";
import infoIconBlue from "../../assets/images/info-icon-blue.svg";
import {dateFormatter} from "../../utils/dateFormatting";


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

interface CurrencyToggleToolTipProps {
  currencyRateDate: string | null | undefined;
}


export const CurrencyToggleToolTip: FunctionComponent<CurrencyToggleToolTipProps> = ({currencyRateDate}) => {
  return <OverlayTrigger
    placement="bottom"
    overlay={
      <Tooltip id="button-tooltip-2" arrowProps={{style: {'display': "none", 'height': '0px'}}}>
        <ParentDiv>
          <Heading>Currency</Heading>
          {currencyRateDate ?
            <Description>{`This currency conversion is based on rates as of ${dateFormatter(currencyRateDate)} and provided for information purposes only`}</Description> :
            <Description>This currency conversion is provided for information purposes only</Description>}
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

export default CurrencyToggleToolTip;
