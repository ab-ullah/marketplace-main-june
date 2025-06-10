import styled from "styled-components";
import Modal from "react-bootstrap/Modal";

export const EligibilityModal = styled(Modal)`
  .modal-content {
    border-radius: 8px;
    border: 0;

    .modal-header,
    .modal-footer {
      border: 0;
      padding: 24px;
    }

    .modal-body {
      padding: 0 24px 24px 24px;
    }

    .modal-header {

      .modal-title {
        font-family: 'Inter';
      }
    }

    .modal-footer {

      .btn {
        min-width: 88px;
      }
    }
  }

  &.create-form-modal {
    border: 2px solid red;

    .modal-dialog {
      max-width: 1158px;
    }

    .modal-content {

      .modal-header,
      .modal-footer {
        border: 0;
        padding: 24px;
      }

      .modal-body {
        padding: 0;

        .nav-tabs {
          padding-right: 24px;
        }

        .tab-pane {
          background: #fff;
          padding: 33px 24px 10px;
        }
      }
    }
  }
}

.nav-tabs {
  background: #fff;
  border: 0;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.15);
  padding-right: ${props => props.theme.palette.eligibilityTheme.contentPadLg};
  position: relative;
  z-index: 2;

  .nav-item {
    padding-left: 22px;
    padding-right: 22px;

    .nav-link {
      border: 0;
      color: ${props => props.theme.palette.eligibilityTheme.black};
      position: relative;
      z-index: 1;
      font-family: 'Quicksand Bold';
      font-size: 18px;
      letter-spacing: 0.02em;
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 18px;

      &.active {
        color: ${props => props.theme.palette.eligibilityTheme.flatBlue};

        &:after {
          content: '';
          background: ${props => props.theme.palette.eligibilityTheme.flatBlue};
          height: 4px;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0px;
        }
      }

      &:hover {
        color: ${props => props.theme.palette.eligibilityTheme.flatBlue};
      }
    }

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }
  }
`