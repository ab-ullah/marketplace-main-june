import Button from "react-bootstrap/Button";
import styled from "styled-components";
import Modal from "react-bootstrap/Modal";

export const StyledButton = styled(Button)`
  padding: 10px 30px 10px 24px;
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


export const StyledModal = styled(Modal)`
  .modal-header {
    border-bottom: none;
    padding-bottom: 0;
  }
`