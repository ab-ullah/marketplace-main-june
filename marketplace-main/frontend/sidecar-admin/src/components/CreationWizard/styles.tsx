import styled from "styled-components";
import Dropdown from "react-bootstrap/Dropdown";
import Container from "react-bootstrap/Container";
import BSNav from 'react-bootstrap/Nav';
import {Link} from "react-router-dom";

export const CreationWizardContainer = styled(Container)`
  margin-top: 70px;
  min-height: calc(100vh - 80px);

  .nav-tabs {
    background: #fff;
    border: 0;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
    padding-left: ${props => props.theme.palette.eligibilityTheme.contentPadLg};
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
            bottom: 0;
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
  }

  .tab-content {
    background: ${props => props.theme.palette.eligibilityTheme.grayLightest};
    position: relative;
    z-index: 1;

    .tab-pane {
      padding: ${props => props.theme.palette.eligibilityTheme.contentPadLg};
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
  }

  .tab-pane.create-form-tab {
    padding: 0;

    .row {
      margin: 0;

      > [class*='col-'] {
        padding: 0;

        .col-head {
          margin-bottom: 30px;

          h4 {

            .btn {
              float: right;
              margin-top: -5px;
            }
          }
        }

        .nav-item {

          .nav-link {
            color: ${props => props.theme.palette.eligibilityTheme.black};
            letter-spacing: 0.02em;
            font-size: 16px;
            padding-left: 0;
            padding-right: 0;
            margin-bottom: 15px;
            font-family: 'Quicksand Medium';

            &.active {
              color: ${props => props.theme.palette.eligibilityTheme.flatBlue};
              background: transparent;

              .block-tag {
                color: #fff;
                background: #2E86DE;
              }
            }

            &:hover {
              cursor: pointer;
            }
          }
        }

        .create-form-card {
          background: #fff;
          padding: 24px;
          border: 1px solid #CFD8DC;
          border-radius: 4px;
          margin-bottom: 24px;
          position: relative;

          .action-btns {
            top: 32px;
            right: 8px;
          }
          .block-tag {
            margin-bottom: 35px;

            .category-name {
              position: absolute;
              right: 80px;
              background: #EFEEED;
              padding: 5px 20px;
              border-radius: 25px;
              margin-bottom: 35px;
              font-size: 12px;
              color: ${props => props.theme.palette.eligibilityTheme.black};;
              font-weight: 700;
            }
          }

          .dots-dropdown-menu {
            position: absolute;
            right: 30px;
            top: 26px;
          }

          p {
            color: #607D8B;
            margin: 25px 0;
          }

          &.focused {
            background: #EBF3FB;
            box-shadow: 0 0 10px rgba(46, 134, 222, 0.5);

            .block-tag {
              color: ${props => props.theme.palette.eligibilityTheme.black};
            }
          }
          .delete-icon{
            position: absolute;
            bottom: 8px;
            right: 8px;
            cursor: pointer;
          }
        }

        .block-tag {
          color: #78909C;
          background: #EFEEED;
          padding: 10px 16px;
          border-radius: 4px;
          margin-right: 16px;
          display: inline-block;
          vertical-align: middle;
          font-size: 16px;
          font-family: 'Quicksand Bold';

          img {
            margin-left: 15px;
            margin-top: -1px;
          }

          span {
            color: inherit;
            margin-left: 18px;
            font-family: 'Quicksand Bold';
          }
        }

        .form-control,
        .form-select {
          font-size: 14px;
          max-width: 560px;
        }

        &:first-child {
          max-width: 410px;
          background: #fff;
          padding: 30px 20px 20px ${props => props.theme.palette.eligibilityTheme.contentPadLg};
        }
      }
    }
  }

  .tabs-cta-section {
    padding: 0 ${props => props.theme.palette.eligibilityTheme.contentPadLg} 0 10px;
    margin-bottom: -40px;
    background: #fff;
    position: absolute;
    z-index: 1;
    right: 0;
    bottom: 0;

    span {
      font-size: 16px;
      margin-right: 15px;
      color: ${props => props.theme.palette.eligibilityTheme.grayishBlue};
      font-family: 'Quicksand Medium';
      vertical-align: middle;
    }

    .btn {
      padding: 8px 32px !important;
    }
  }
`

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`

export const BlockActions = styled(Dropdown)`
position: absolute;
right: 0;
top: 0;
> button {
  background: transparent !important;
  border-color: transparent !important;
  width: auto;
  padding: 0 !important;
  margin: 0 !important;
  text-align: right;
  &:focus {
    border-color: transparent !important;
    box-shadow: 0 0 0 0 transparent !important;
  }
  &::focus {
    border-color: transparent !important;
    box-shadow: 0 0 0 0 transparent;
  }
  svg {
    fill: #78909C;
    float: right;
  }
}
> div {
  left: -132px !important;
}
.dropdown-item {
  color: #020203;
  display: flex;
  &:hover {
    background:#EBF3FB;
  }
  svg {
    fill: #020203;
    width: 18px;
    position: relative;
    bottom: 0;
    margin-right: 4px;
  }
  
}
.delete-link{
    color: #F42222;
    svg {
      fill: #F42222;
    }
  }
`

export const NavItem = styled(BSNav.Item)`
  position: relative;
  padding-right: 36px;
  a {
    display: flex;
  }
  .block-tag {
    width: 78px;
  }
  .block-name {
    vertical-align: middle;
    align-items: center;
    display: flex;
  }
  .action-btns {
    top: 20px;
  }
`