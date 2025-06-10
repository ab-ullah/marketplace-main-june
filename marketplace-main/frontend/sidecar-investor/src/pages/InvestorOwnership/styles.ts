import styled from "styled-components";
import {Link} from "react-router-dom";
import Container from "react-bootstrap/Container";

export const NotificationDetailLink = styled(Link)`
  text-decoration: none;
`

export const OwnerShipContainer = styled(Container)`
  padding: 48px;
`


export const NotificationTableHeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  > svg {
    font-size: 1rem;
  }
`

export const DatePickerContainer = styled.span`
  .date-range {
    z-index: 101;
    position: absolute;
  }`
