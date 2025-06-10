import styled from "styled-components";
import {Link} from "react-router-dom";

export const StyledLink = styled(Link)`
  text-decoration: none;
  font-size: 18px;
  font-weight: 700;
  line-height: 20px;
  color: ${props => props.theme.palette.primary} !important;;
`