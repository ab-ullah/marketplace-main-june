import styled from "styled-components";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Link} from "react-router-dom";

export const StyledContainer = styled(Container)`
  padding: 40px;
`

export const ButtonRow = styled(Row)`
  display: inline-flex;
  flex-wrap: nowrap;
  
  .button-div {
    width: auto;
  }
  
  button {
    align-items: flex-start;
    padding: 16px 26px;
    background: #03145E;
    border-radius: 50px;
    color: #FFFFFF;
    font-size: 16px;
  }
`

export const GraphCol = styled(Col)`
  background: #E6E6F1;
  border-radius: 3px;
`


export const FundInvestmentLink = styled(Link)`
  text-decoration: underline;
`
