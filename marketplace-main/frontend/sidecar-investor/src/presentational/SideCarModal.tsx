import styled from "styled-components";
import Modal from "react-bootstrap/Modal";

export const SideCarModal = styled(Modal)`
  .modal-content {
    border-radius: 12px;
    border: none;
  }
  
  .modal-header{
    background: ${props => props.theme.palette.common.brandColor};
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
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

`