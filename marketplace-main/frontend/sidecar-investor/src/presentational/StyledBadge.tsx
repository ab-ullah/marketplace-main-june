import styled from "styled-components";
import {Badge} from "react-bootstrap";

const StyledBadge = styled(Badge)`
  font-size: 12px;
  padding: 5px 12px;
  white-space: normal;
  text-align: left;

  &.bg-primary {
    background: rgba(72, 128, 255, 0.1) !important;
    color: #4880FF;
    text-decoration: underline;
  }

  &.bg-danger {
    background: rgba(252, 238, 234, 1) !important;
    color: #FF5722;
  }
`;

export default StyledBadge;
