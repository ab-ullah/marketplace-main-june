import styled from "styled-components";
import {ListGroup} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

export const ReviewersList = styled(ListGroup)`
  margin-bottom: 20px;

  .list-group-item {
    padding: 0;
    border: 0;
    overflow: auto;
    margin-top: 16px;

    .badge {
      background: #ECEFF1 !important;
      color: ${props => props.theme.palette.eligibilityTheme.black};
      font-size: 14px;
      vertical-align: middle;
      padding: 7px 14px;

      .btn-close {
        font-size: 10px !important;
        margin-left: 4px;
      }
    }

    span {
      font-size: 16px;
      color: #90A4AE;
      font-family: 'Quicksand Medium';

      img {
        margin-left: 10px;
      }
    }
  }
`

export const PublishForm = styled(Form)`
  .form-label {
    font-family: 'Quicksand Bold';
    font-size: 15px;
    letter-spacing: 0.15px;
    margin-bottom: 3px;
  }

  p {
    font-size: 16px;
  }

  .form-select {
    border-color: #D5CBCB;
    border-radius: 8px;
    font-size: 18px;
  }
`

export const StyledPublishModal = styled(Modal)`
  .modal-header {
    border-bottom: none;
    padding-bottom: 0;
  }

  .modal-body {
    padding: 30px;
  }
`
export const CopyTextDiv = styled.div`
  position: absolute;
  left: 20px;
  cursor: pointer;
  
  .text-img {
    color: #2E86DE;
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 20px;

    img {
      margin-bottom: 2px;
    }
  }
`
