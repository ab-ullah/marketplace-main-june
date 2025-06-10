import styled from "styled-components";
import Container from "react-bootstrap/Container";
import {Link} from "react-router-dom";

export const StyledTabContainer = styled(Container)`
  min-height: calc(100vh - 80px);
  margin: 0;

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
    background: ${props => props.theme.palette.eligibilityTheme.greyBg};
    position: relative;
    z-index: 1;

    // .tab-pane {
    //   padding-top: ${props => props.theme.palette.eligibilityTheme.contentPadLg};
    // }

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
      }

      .tab-content-title {
        font-size: 32px;
        margin-top: 3px;
        margin-bottom: 0;
      }
    }
  }

  .tabs-cta-wrapper {
    position: relative;
  }
  .tabs-cta-section {
    background: transparent;
    position: absolute;
    z-index: 3;
    right: 24px;
    top: 0;

    span {
      font-size: 16px;
      margin-right: 15px;
      color: ${props => props.theme.palette.eligibilityTheme.grayishBlue};
      font-family: 'Quicksand Medium';
      vertical-align: middle;
      position: relative;
      bottom: 8px;
    }

    .btn {
      padding: 8px 32px !important;
    }
  }
`

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: #90A4AE;
`