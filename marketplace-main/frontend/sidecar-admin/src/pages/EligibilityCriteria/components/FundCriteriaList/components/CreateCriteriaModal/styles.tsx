import Button from "react-bootstrap/Button";
import styled from "styled-components";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

export const StyledButton = styled(Button)`
  padding: 10px 30px 10px 24px;
  background: #470C75;
  border-color: #470C75;
  border-radius: 70px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  line-height: 22px;
  color: #FFFFFF;
  margin-top: 20px;
`

export const ModalHeading = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`

export const StyledForm = styled(Form)`
  font-size: 15px;

  label {
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    line-height: 21px;
    color: #020203;
    margin-bottom: 5px;
    margin-top: 25px;
  }

  input {
    border: 1px solid #D5CBCB;
    box-sizing: border-box;
    border-radius: 8px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    color: #020203;
  }

  textarea {
    border: 1px solid #D5CBCB;
    box-sizing: border-box;
    border-radius: 8px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    color: #020203;
    height: 120px;

  }

  .error {
    color: red;
    font-size: 12px;
  }

  button {
    float: right;
    margin-top: 40px;
    padding: 8px 18px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 20px;
    border-radius: 70px;
  }

  .create {
    background: #470C75;
    border-color: #470C75;
    color: #FFFFFF;
    margin-left: 20px;
  }

  .cancel {
    background: #FFFFFF;
    border-color: #470C75;
    color: #470C75;
  }
`

export const StyledModal = styled(Modal)`
  .modal-header {
    border-bottom: none;
    padding-bottom: 0;
  }
`