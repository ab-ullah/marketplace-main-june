import styled from "styled-components";
import Form from "react-bootstrap/Form";
import CurrencyFormatInput from "react-currency-format";

export const Label = styled(Form.Label)`
  font-size: 15px !important;
  font-weight: 700 !important;
  margin-bottom: 0;
`;

export const CurrencyFormat = styled(CurrencyFormatInput)`
  background: #ffffff;
  border: 1px solid #d5cbcb;
  box-sizing: border-box;
  border-radius: 8px;
  min-width: 100%;
  padding: 0.375rem 0.75rem;
  font-family: Quicksand;
  font-weight: normal;
  font-size: 16px !important;
  &.disabled {
    background: #e9ecef;
  }
`;


export const CheckboxBlock = styled(Form.Check)`
  background-color: #2E86DE;
  font-family: 'Quicksand';
  color: #FFF;
  display: inline-block;
  margin-right: 8px;
  padding: 13px 14px;
  font-size: 16px;
  border-radius: 4px;
  input {
    margin-left: 0 !important;
    margin-right: 12px;
  }
  label {
    color: #FFF;
  }
`