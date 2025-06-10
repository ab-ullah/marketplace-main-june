import styled from "styled-components";
import {Link} from "react-router-dom";
import { Form, Tab } from "react-bootstrap";
import {ErrorMessage} from "formik";

export const FundDetailLink = styled(Link)`
  float: right;
  margin-left: 10px;
  text-decoration: none;
`

export const StyledTab = styled(Tab)`
display: none !important;
.nav-link.active {
  display: none;
}
`

export const TabsWarpper = styled.div`
  .nav-item .active {
    color: #2E86DE;
    border: none;
    border-bottom: 3px solid #2E86DE;
  }
`

export const LinkButton = styled.span`
  color: blue;
  text-decoration: underline;
  cursor: pointer;
`

export const CheckboxBlock = styled(Form.Check)`
  color: #000;
  background: #F5F7F8;
  border-radius: 8px;
  margin-right: 8px;
  margin-top: 8px;
  padding: 12px 16px;
  border: 1px solid #D5DAE1;
  border: 1px solid ${props => props.checked ? "#610094": '#D5DAE1'};
  
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  max-width: fit-content;
  
  input {
    margin-left: 0 !important;
    margin-right: 8px;
    margin-top: 0;
    padding: 10px;
    width: 10px;
    //background-repeat: no-repeat;
  }
  label {
    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.02em;
    color: #020203;

  }
`

export const CheckboxWrapper = styled.div`
  padding: 0 20px 18px 3px;
  display: flex;
  flex-wrap: wrap;

  .form-check-input:checked {
    background-color: #610094 !important;
    border: 1px solid #610094  !important;;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;;
    border-radius: 4px !important;;
  }
`

export const ErrorText = styled(ErrorMessage)`
  color: red;
  margin-top: -20px;
`

export const AccessLevelDiv = styled.div`
  font-family: 'Quicksand';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #020203;
`

export const UserActionDiv = styled.div`
  margin-top: 24px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  
  button {
    padding: 10px 32px;
    gap: 4px;
    width: 88px;
    height: 36px;

    font-family: 'Quicksand';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 24px;
    
    .filled {
      background: #610094 !important;
      color: #ffffff !important;
    }
  }
  `