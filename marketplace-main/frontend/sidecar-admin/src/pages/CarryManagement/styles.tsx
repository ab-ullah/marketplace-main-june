import styled from "styled-components";
import Container from "react-bootstrap/Container";

export const TabsContainer = styled(Container)<{top:number}>`
  padding-left: 0px;
  padding-right: 0px;
  width: 100vw;
  margin-top: ${props => props.top + 'px'};

  .nav-tabs {
    background: #fff;
    border: 0;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
    padding-left:80px;
    padding-right:80px;
    position: sticky;
    top: ${props => props.top + 'px'};
    width: 100%;
    z-index: 2;

    .nav-item {
      padding-left: 24px;
      padding-right: 24px;

      .nav-link {
        border: 0;
        color: ${props => props.theme.palette.eligibilityTheme.black};
        position: relative;
        z-index: 1;
        font-family: 'Inter';
        font-size: 16px;
        font-weight: 600;
        line-height: 20px;
        letter-spacing: 0.02em;
        padding-left: 0;
        padding-right: 0;
        padding-bottom: 18px;
        padding-top: 16px;

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
    background: ${props => props.theme.palette.eligibilityTheme.grayLightest};
    position: relative;
    z-index: 1;
    padding: 37px 80px;

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