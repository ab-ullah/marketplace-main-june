import styled from "styled-components";
import {Link} from "react-router-dom";

export const FundDetailLink = styled(Link)`
  float: left;
  text-decoration: underline;
  color: ${props => props.theme.palette.common.tableTextColor};
`

export const FundInvestmentLinks = styled(Link)`
  float: right;
  text-decoration: none;
  margin-left: 10px;
`