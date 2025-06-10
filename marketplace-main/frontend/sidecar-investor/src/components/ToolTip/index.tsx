import React, { FunctionComponent, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ColSpan, Description, Heading, Image, InfoButton, ParentDiv } from "./styles";
import infoIconWhite from "../../assets/images/info-icon-white.svg";
import { ToolTipText } from "./interfaces";

export const ToolTip: FunctionComponent<ToolTipText> = ({ description, heading }) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <ColSpan>
      <OverlayTrigger
        show={show}
        placement="bottom"
        overlay={
          <Tooltip
            id="button-tooltip-2"
            onMouseEnter={handleShow}
            onMouseLeave={handleClose}
          >
            <ParentDiv>
              <Heading>{heading}</Heading>
              <Description>{description}</Description>
            </ParentDiv>
          </Tooltip>
        }
      >
        {({ ref, ...triggerHandler }) => (
          <InfoButton
            variant="clear"
            {...triggerHandler}
            onMouseEnter={handleShow}
            onMouseLeave={handleClose}
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

export default ToolTip;