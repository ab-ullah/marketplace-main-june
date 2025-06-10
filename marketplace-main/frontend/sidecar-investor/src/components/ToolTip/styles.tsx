import styled from "styled-components";
import { Button, Image as BSImage } from "react-bootstrap";

export const ParentDiv = styled.div``;

export const Heading = styled.div`
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  color: #000000;
  text-align: left;
`;

export const Description = styled.div`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: 0.02em;
  color: #000000;
  text-align: left;
  white-space: break-spaces;
`;

export const ColSpan = styled.span`
  position: relative;
  .info-icon{
    padding: 0px;
    padding-left: 7px;
  }
`;

export const InfoButton = styled(Button)`
  position: absolute;
  left: 98%;
`;

export const RsuiteInfoButton = styled(Button)`
  position: absolute;
  bottom: ${props => props.bottom ? props.bottom:'4%'};
  margin-left: 8px;
`;

export const Image = styled(BSImage)`
  filter: hue-rotate(0deg) invert(100%);
`;