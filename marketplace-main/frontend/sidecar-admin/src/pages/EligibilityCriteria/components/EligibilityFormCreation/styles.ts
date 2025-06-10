import styled from "styled-components";
import { Link as ReactLink } from "react-router-dom";


export const ModalHeading = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`

export const Link = styled(ReactLink)`
  border-bottom: 1px dashed #020203;
  color: inherit;
  text-decoration: none;
  &:hover{
    color: inherit;
    text-decoration: none;
  }
`
