import styled from "styled-components";
import Form from "react-bootstrap/Form";

const LABEL_FONT_SIZE = '20px';
const VALUE_FONT_SIZE = '16px';

export const StyledForm = styled(Form)`
  font-size: 14px;
  
  .field-label {
    font-family: Quicksand Medium;
    font-style: normal;
    font-size: ${LABEL_FONT_SIZE};
    line-height: ${LABEL_FONT_SIZE};
    color: #2E2E3A;
    display: flex;
    align-content: stretch;
    align-items: center;
  }
  
  input {
    padding: 14px 16px;
    background: #F2F3F5;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: ${VALUE_FONT_SIZE};
    line-height: ${VALUE_FONT_SIZE};
    color: #2E2E3A;
    border: none;
    width: 100%;
  }
  
  .select__control {
    padding: 14px 16px;
    background: #F2F3F5;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: ${VALUE_FONT_SIZE};
    line-height: ${VALUE_FONT_SIZE};
    color: #2E2E3A;
    border: none;
  }
  
  .select__value-container {
    padding: 0;
  }
  
  .select__menu {
    padding: 14px 16px;
    background: #F2F3F5;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: ${VALUE_FONT_SIZE};
    line-height: ${VALUE_FONT_SIZE};
    color: #2E2E3A;
  }
  
  .form-label {
    margin-top: 0.8rem;
    margin-bottom: 0.1rem;
  }
  
  .submit-button {
    background: #03145E;
    border-radius: 20px;
    color: #FFFFFF;
    margin-top: 10px;
    margin-bottom: 20px;
    float: right;
  }
`