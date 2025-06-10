import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';


export const ModalContainer = styled(Modal)`
  .modal-dialog{
    .modal-content{
      min-height: 600px;
      min-width: 720px;
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
        //height:calc(80vh - 240px);
        min-height: 600px;
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
    .file-tag {
      cursor: pointer;
      background-color: ${props => props.theme.palette.input.background};
      border: 1px solid;
      border-color: ${props => props.theme.palette.input.border};
      padding: 16px;
      border-radius: 28px;
      display: inline-flex;
      align-items: center;
      margin-bottom: 8px;
      margin-right: 4px;
      .form-check{
        display: flex;
        align-items: center;
        .form-check-input:checked {
          background-color: ${props => props.theme.palette.input.main};
          border-color: ${props => props.theme.palette.input.main};
        }
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
    }
    > img {
      cursor: pointer;
      margin: 0 4px 0 0 !important;
      vertical-align: initial;
    }
    svg {
      fill: #2E86DE;
    }
`;


export const CloseButton = styled(Button)`
  align-self: flex-end;
  background-color: ${props => props.theme.palette.primary} !important;
  border-color: ${props => props.theme.palette.primary} !important;
  border-radius: 70px;
  padding: 10px 30px;
  width: fit-content;
  :hover {
    background-color: ${props => props.theme.palette.primary} !important;
    border-color: ${props => props.theme.palette.primary} !important;
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
export const DownloadIcon = styled(DownloadForOfflineOutlinedIcon)`
fill:  ${props => props.theme.palette.primary} !important;
`
export const PreviewIcon =styled(VisibilityOutlinedIcon)`
fill:  ${props => props.theme.palette.primary} !important;
`