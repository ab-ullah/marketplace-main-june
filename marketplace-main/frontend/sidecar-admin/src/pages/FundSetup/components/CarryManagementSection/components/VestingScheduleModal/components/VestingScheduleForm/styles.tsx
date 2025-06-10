import { Col, Row } from "react-bootstrap";
import styled from "styled-components";

export const DatePickerContainer = styled.div`
  width: 100%;
  margin-top: 10px;
  .date-title {
    margin-bottom: 2px;
  }

  .datepicker {
    width: inherit;
  }

  input {
    background: #ffffff;
    border: 1px solid #d5cbcb;
    box-sizing: border-box;
    border-radius: 0.25rem;
    min-width: 100%;
    padding: 5px;
    font-family: Quicksand;
    font-weight: normal;
    font-size: 16px !important;
  }
`;

export const ResultWrapper = styled(Row)`
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 150px;
  border: 1px dotted;
  span {
    text-align: center;
  }
`;

export const VestedCol = styled(Col)`
  text-align: center;
  padding: 20px;

  p{
    margin-bottom:0px;
  }

  p:first-child {
    font-size: 40px;
    font-weight: bold;
  }
`;

export const HoverText = styled.p`
  margin-bottom: 0px;
  color: cadetblue;
  cursor: help;
  font-size: 10px;
  svg {
    fill: cadetblue;
    margin-bottom: 2px;
    font-size: inherit;
  }
`;