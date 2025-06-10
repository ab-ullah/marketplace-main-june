import styled from "styled-components";
import Form from "react-bootstrap/Form";
import { Modal } from "react-bootstrap";

export const Label = styled.p`
  margin: 0px;
  font-size: 20px;
`;

export const Description = styled.p`
  margin: 0px;
  font-size: 12px;
  color: grey;
`

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
    &:disabled {
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

export const StyledModal = styled(Modal)`
    .modal-xl {
        width: 96vw;
        max-width: 98vw;
    }
`

export const HurdlePreferenceWrapper = styled.div`
  .row {
   margin-top: 0 !important;
  }
`