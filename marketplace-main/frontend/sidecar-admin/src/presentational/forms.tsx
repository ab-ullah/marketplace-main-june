import styled from "styled-components";
import Form from "react-bootstrap/Form";

const LABEL_FONT_SIZE = "14px";
const VALUE_FONT_SIZE = "14px";

export const StyledForm = styled(Form)`
  font-size: 14px;

  .field-label {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: ${LABEL_FONT_SIZE};
    line-height: ${LABEL_FONT_SIZE};
    color: #2e2e3a;
    display: flex;
    align-content: stretch;
    align-items: center;
  }

  input {
    padding: 14px 16px;
    background: #fff;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: ${VALUE_FONT_SIZE};
    line-height: ${VALUE_FONT_SIZE};
    color: #2e2e3a;
    border: none;
    width: 100%;
  }

  .select__control {
    padding: 14px 16px;
    background: #f2f3f5;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: ${VALUE_FONT_SIZE};
    line-height: ${VALUE_FONT_SIZE};
    color: #2e2e3a;
    border: none;
  }

  .select__value-container {
    padding: 0;
  }

  .select__menu {
    padding: 14px 16px;
    background: #f2f3f5;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: normal;
    font-size: ${VALUE_FONT_SIZE};
    line-height: ${VALUE_FONT_SIZE};
    color: #2e2e3a;
  }

  .form-label {
    margin-top: 0.8rem;
    margin-bottom: 0.1rem;
  }

  .submit-button {
    background: #03145e;
    border-radius: 20px;
    color: #ffffff;
    margin-top: 10px;
    margin-bottom: 20px;
    display: inline-block;
    font-size: 14px;
    &:disabled{
      color: #ffffff;
    }
  }

  .cancel-button {
    background: #ffffff;
    border-radius: 20px;
    color: #03145e;
    margin-top: 10px;
    margin-bottom: 20px;
    display: inline-block;
    font-size: 14px;
  }
`;

export const StyledSwitch = styled(Form.Check)`
  min-height: 2.5em;
  display: flex;
  align-items: center;
  input {
    background-repeat: no-repeat;
    width: 3em !important;
    ${props => props.variant === 'sm' ? 'width: 2em !important;': 'width: 3em !important;'}
    margin-right: 1em;
    border: 1px solid #d5cbcb;
  }
  label {
    margin-top: 5px !important;
    ${props => props.variant === 'sm' ? 'margin-top: 3px !important;': 'margin-top: 5px !important;'}
  }
`;
