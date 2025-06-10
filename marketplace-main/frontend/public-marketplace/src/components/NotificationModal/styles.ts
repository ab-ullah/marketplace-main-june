import { Modal } from 'react-bootstrap'
import styled from 'styled-components'

export const ModalContainer = styled(Modal)`
  .modal-dialog{
    min-height: 400px;
    display: flex;
	flex-direction: column;
    justify-content: center;
  }
`;