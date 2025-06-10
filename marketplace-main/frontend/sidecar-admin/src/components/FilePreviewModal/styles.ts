import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import { SideCarModal } from '../../presentational/SideCarModal';
import { Edit } from '@material-ui/icons';

export const ModalContainer = styled(SideCarModal)`
  .modal-dialog{
    .modal-content{
      min-height: calc(80vh);
      max-width: calc(100vw - 100px);
      @media (max-width: 768px) {
        max-width: 100vw;
      }
      .modal-header{
        background: white;
        border-bottom: none;
        .modal-title{
          color: ${props => props.theme.palette.common.primaryTextColor};
        }
      }
      .modal-body{
        height:calc(80vh - 240px);
        object{
          flex: 1;
          width: 100%;
          span{
            align-items: center;
            display: flex;
            flex:1;
            height: 100%;
            justify-content: center;
          }
        }
        display: flex;
        flex-direction: column;
      }
    }
  }
`;

export const ButtonWrapper = styled.div`
display: flex;
align-items: center;
    .file-tag {
      cursor: pointer;
      background-color: #EBF3FB;
      padding: 16px;
      border-radius: 28px;
      display: inline-flex;
      align-items: center;
      margin-bottom: 8px;
      margin-right: 4px;
      .form-check {
        display: flex;
        align-items: center;
      }
      label {
        margin: 0;
        max-width: 240px;
        text-overflow: ellipsis;
        padding-top: 3px;
        overflow-x: hidden;
        padding-left: 8px;
      }
    }
    .doc-name {
      border-bottom: 1px dotted;
      max-width: 240px;
      text-overflow: ellipsis;
      padding-top: 3px;
      overflow-x: hidden;
    }
    > img {
      cursor: pointer;
      margin: 0 4px 8px 0 !important;
      vertical-align: initial;
    }
    svg {
      fill: #2E86DE;
    }
`;


export const CloseButton = styled(Button)`
  align-self: flex-end;
  background-color: #470C75;
  border-color: #470C75;
  border-radius: 70px;
  padding: 10px 30px;
  width: fit-content;
  :hover {
    background-color: #470C75;
    border-color: #470C75;
  }
`;

export const DeleteButton = styled(CloseButton)`
  background-color: #F42222 !important;
  border-color: #F42222 !important;
  &:hover {
    background-color: #F42222 !important;
    border-color: #F42222 !important;
  }
`

export const PreviewContainer = styled.div`
  align-items: center;
  background-color: #ECEFF1;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  height: inherit;
  img{
    height: inherit;
  }
`;

export const ModalFooter = styled(Modal.Footer)`
  justify-content: space-between;
`

export const EditButton = styled(Edit)`
  // fill: #F42222;
  font-size: 22px !important;
  margin-bottom: 6px !important;
`