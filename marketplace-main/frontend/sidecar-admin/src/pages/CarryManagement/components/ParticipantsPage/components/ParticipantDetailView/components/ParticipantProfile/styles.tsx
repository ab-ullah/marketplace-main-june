import { Card, Container, Button } from "react-bootstrap";
import styled from "styled-components";

export const TabContainer = styled(Container)`
  padding-left: 0px;
  padding-right: 0px;
  margin-left: -12px;
  max-width: 1577px;

  .nav-tabs {
    background: ${props => props.theme.palette.eligibilityTheme.grayLightest};
    border: 1px solid #D5DAE1;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
    padding-left:30px;
    padding-right:80px;
    position: relative;
    z-index: 2;

    .nav-item {
      padding-left: 24px;
      padding-right: 24px;

      button {
        background: ${props => props.theme.palette.eligibilityTheme.grayLightest};
      }

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
            bottom: 0;
          }
        }

        &:hover {
          color: ${props => props.theme.palette.eligibilityTheme.flatBlue};
        }
      }

      &:first-child {
        padding-left: 0px;
      }

      &:last-child {
        padding-right: 0;
      }
    }
    @media (max-width: 991px) {
      padding: 0px 24px;
    }
  }

  .tab-content {
    background: #fff;
    position: relative;
    z-index: 1;

    .marketing-pages-container{
      padding: 0;
    }

    a{
      color: #020203;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
    }

    .tab-content-header {
      padding: 0 0 15px;

      .col:last-child {
        text-align: right;

        form {
          display: inline-block;
          vertical-align: middle;

          input {
            width: 298px;
            height: 44px;
          }
        }

        .btn-primary {
          color: #fff;
          font-size: 18px;
          background: ${props => props.theme.palette.eligibilityTheme.purplePrimary};
          border-color: ${props => props.theme.palette.eligibilityTheme.purplePrimary};
          letter-spacing: 0.02em;
          padding: 7px 32px 8px;
          margin-left: 24px;

          &:hover {
            background: darken(${props => props.theme.palette.eligibilityTheme.purplePrimary}, 5%);
            border-color: darken(${props => props.theme.palette.eligibilityTheme.purplePrimary}, 5%);
          }
        }
      }

      .tab-content-title {
        font-size: 32px;
        margin-top: 3px;
        margin-bottom: 0;
      }
    }

    @media (max-width: 991px) {
      padding: 10px 24px;
    }
  }
`

export const Heading = styled.h1`
    font-size: 48px;
    font-weight: 700;
`

export const ParticipantCard = styled(Card)`
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    padding: 15px 0px;
  }

  h6 {
    margin-top: 10px
  }
`

export const DetailLabel = styled.p`
  font-weight: 400;
  font-size: 16px;
  color: #607D8B
`

export const DetailValue = styled.p`
  font-weight: 500;
  font-size: 16px;
  color: #020203
`

export const DetailWrapper = styled.div`
    display: flex;
    gap: 10px;
    border-bottom: 1px solid #E2E6EB;
    margin-top: 15px;
    .status-label {
      font-size: 16px;
      color: #607D8B
    }
`

export const CustomButton = styled(Button)`
  svg {
    fill: #470C75;
    width: 0.75em;
    margin-right: 3px;
  }
  &:hover {
    svg {
        fill: #fff;
      }
}
`

export const DocumentWrapper = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  img {
    cursor: pointer;
  }
`

export const UndeleteDocBtn = styled(Button)`
  display: flex;
  gap: 5px;
  width: 120px;
  align-items: center;
  padding: 5px 10px;
  border-radius: 5px !important;
  background: rgba(244, 34, 34, 0.1) !important;
  border-color: rgba(244, 34, 34, 0.1) !important;
  color: #F42222 !important;
  svg {
    fill: #F42222;
  }
  &:hover {
    svg {
        fill: #F42222;
      }
}
`

export const FormContainer = styled.div`
  label {
    font-weight: 400 !important;
   }
  .form-label {
    font-weight: 400 !important;
  }
  .field-label {
    font-weight: 400 !important;
  }
`