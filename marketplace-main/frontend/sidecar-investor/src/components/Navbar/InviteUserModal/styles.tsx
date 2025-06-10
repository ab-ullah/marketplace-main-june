import { ErrorMessage } from "formik";
import { Form } from "react-bootstrap";
import styled from "styled-components";

export const DocumentFormDiv = styled.div`
  .text-label {
    font-family: "Quicksand";
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #020203;
    margin-bottom: 8px;
  }

  .text-input {
    border: 1px solid #d5dae1;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    font-family: "Inter";
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 24px;
    height: 46px;
  }

  .field-label {
    font-family: "Quicksand";
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #020203;
  }

  .form-check {
    margin-top: 24px;
  }

  .gp-selector {
    margin-top: 24px;

    .select__control {
      border: 1px solid #d5dae1;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 6px 14px;
    }

    .select__indicator-separator {
      display: none;
    }
  }
`;

export const ErrorText = styled(ErrorMessage)`
  color: red;
  margin-top: -20px;
`;

export const AccessLevelDiv = styled.div`
  font-family: "Quicksand";
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #020203;
`;
export const CheckboxWrapper = styled.div`
  padding: 0 20px 18px 3px;
  display: flex;
  flex-wrap: wrap;

  .form-check-input:checked {
    background-color: #610094 !important;
    border: 1px solid #610094 !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    border-radius: 4px !important;
  }
  .form-check-input{
    background-color: white;
  }
`;

export const CheckboxBlock = styled(Form.Check)`
  color: #000;
  background: #f5f7f8;
  border-radius: 8px;
  margin-right: 8px;
  margin-top: 8px;
  padding: 12px 16px;
  border: 1px solid #d5dae1;
  border: 1px solid ${(props) => (props.checked ? "#610094" : "#D5DAE1")};

  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  max-width: fit-content;

  input {
    margin-left: 0 !important;
    margin-right: 8px;
    margin-top: 0;
    padding: 10px !important;
    width: 10px !important;
    // background-repeat: no-repeat;
  }
  label {
    font-family: "Quicksand";
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.02em;
    color: #020203;
  }
`;

export const UserActionDiv = styled.div`
  margin-top: 24px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    width: 88px;
    height: 36px;

    font-family: "Quicksand";
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 24px;

    .filled {
      background: #610094 !important;
      color: #ffffff !important;
    }
  }
`;
