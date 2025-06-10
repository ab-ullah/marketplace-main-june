import { SideCarModal } from '../../../../presentational/SideCarModal';
import Button from 'react-bootstrap/Button';
import styled from 'styled-components';

export const ModalContainer = styled(SideCarModal)`
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

export const CloseButton = styled(Button)`
  align-self: flex-end;
  background-color: #470C75;
  border-color: #470C75;
  border-radius: 70px;
  margin-top: 30px;
  padding: 10px 30px;
  width: fit-content;
  :hover {
    background-color: #470C75;
    border-color: #470C75;
  }
`;

export const FileName = styled.span`
  cursor: pointer;
`;

export const PreviewContainer = styled.div`
  align-items: center;
  background-color: #ECEFF1;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  img{
    max-width: 90%;
  }
  iframe {
    width: 100%;
    height: 100%;
  }
`;

export const PDFContainer = styled.div`
height: 100%;
max-height: 600px;
overflow: auto;
`