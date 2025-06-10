import { Tooltip } from "react-bootstrap";
import styled from "styled-components";


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

export const StyledTooltip = styled(Tooltip)`
    opacity: 1 !important;
    box-shadow: 0 4px 11px rgba(0, 0, 0, .25);
    padding: 0;
    margin-top: 10px;
    .tooltip-arrow {
        display: none;
    }
    .tooltip-inner {
        background: white;
        padding: 5px;
        min-width: 400px;
        border-radius: 0.25rem
    }
    div {
        padding: 5px 8px;
    }
`