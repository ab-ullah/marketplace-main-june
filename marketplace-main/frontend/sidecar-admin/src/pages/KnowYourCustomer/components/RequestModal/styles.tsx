import BSModal from "react-bootstrap/Modal";
import { Button as BSButton } from "react-bootstrap";
import styled from "styled-components";

export const Modal = styled(BSModal)`
  .modal-dialog{
    max-width: 780px;
    width: 100%; 
    @media (max-width: 790px){
      max-width: calc(100% - 20px);
    }
  }
  .modal-content {
    border-radius: 12px;
    border: none;
    width: 100%;
  }
  
  .modal-header{
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
    border-bottom: none;
    font-family: Inter;
    font-size: 40px;
    color: #FFFFFF;
    font-weight: 700;
  }
  
  .btn-close {
    background-color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    border-radius: 50%;
    color: black;
    margin-right: 10px;
  }
  
  .container-fluid {
    font-family: 'Quicksand';
    font-size: 20px;
    color: ${props => props.theme.palette.common.primaryTextColor};
  }
  
  .container {
    font-family: 'Quicksand';
    font-size: 18px;
    color: ${props => props.theme.palette.common.primaryTextColor};
  }

  .modal-body{
    display: flex;
    flex-direction: column;
    .btn{
      font-family: 'Quicksand Bold';
      font-weight: normal;
    }
  }
`;

export const Label = styled.label`
  color: #020203;
  font-family: 'Quicksand Bold';
  font-size: 14px;
`;

export const MessageInput = styled.textarea`
  border: 1px solid #D5CBCB;  
  border-radius: 8px;
  font-size: 18px;
  min-height: 129px;
  padding: 10px 16px;
  resize: none;
`;


export const CancelButton = styled(props => <BSButton {...props} variant="outline-primary" />)`
  border-color: #470C75;
  color: #470C75;
`;

export const SendButton = styled(BSButton)`
  background-color: #470C75;
  border-color: #470C75;
`;

export const ButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-top: 40px;
  padding-bottom: 24px;
`;