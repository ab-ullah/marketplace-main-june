import { Link } from "react-router-dom";
import styled from "styled-components";

export const InvestmentTopDashboard = styled.section<{flex?: number}>`
  background: ${props => props.theme.palette.common.grayColor};
  text-align: left;
  padding: ${props => `${props.theme.baseLine * 3}px ${props.theme.baseLine * 2}px`};
  font-weight: 500;
  
  .hero-dashboard-heading,
  .hero-card-heading {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 24px;
  }

  .hero-dashboard-heading {
    font-size: 32px;
    margin-bottom: ${props => `${props.theme.baseLine * 1}px`};
    color: ${props => `${props.theme.palette.common.secondaryTextColor}`};

    span {
      font-size: 14px;
      font-family: 'Quicksand Bold';
      margin-left: ${props => `${props.theme.baseLine * 0.8}px`};
      color: #091626;
      text-decoration: underline;
      cursor: pointer;

      a {
        font-size: 14px;
        font-family: 'Quicksand', sans-serif;
        margin-left: ${props => `${props.theme.baseLine * 1}px`};
      }
    }
  }

  .hero-card-heading {
    font-size: 24px;
  }

  .row {

    > * {
      padding: 0;
    }
  }

  .card {
    border-radius: 16px !important;
    margin-top: 20px;
    border: 0;
    box-shadow: 0 4px 11px rgba(0, 0, 0, 0.25);

    &.hero-card {
      background: linear-gradient(111.43deg, #F0F0F0 19.07%, #FDFDFD 82.59%);
      box-shadow: 0 4px 11px rgba(0, 0, 0, 0.25);
      border-radius: 12px;
      padding: ${props => `${props.theme.baseLine * 2}px`};
      margin-top: 0;
      margin-left: ${props => `${props.theme.baseLine * 2}px`};
      height: 100%;
    }
  }

  .card-group {
    margin-top: 5px;

    .card {
      flex: ${props => `${props.flex ? props.flex : 24}%`} 0;
      margin-right: 5px;

      .stat-card-body {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }

      .heading {
        color: ${props => props.theme.palette.common.desaturatedBlueColor};
        padding-right: 20px;
        font-size: 15px;
        margin-bottom: ${props => `${props.theme.baseLine / 2}px`};;
        min-height: 40px;
        font-family: 'Quicksand Medium';
      }

      .value {
        color: ${props => props.theme.palette.common.darkNavyBlueColor};
        font-size: 24px;
        line-height: 40px;
        font-family: 'Roboto';
      }
      
    }
  }

  ul {
    font-family: 'Quicksand Medium';
    padding: 0;
    max-width: 305px;
    margin-right: ${props => `${props.theme.baseLine * 2}px`};

    li {
      list-style: none;
      border-top: 1px dotted ${props => props.theme.palette.common.borderGrayColor};
      padding: 10px 0;

      .list-heading {
        font-size: 15px;
      }

      span {
        display: block;
        margin-top: 4px;
      }
    }
  }

  @media screen and (max-width: 1226px) {
    .card-group {
      .card {
        flex: 30% 0;
      }
    }
  }
  @media screen and (max-width: 1199px) {
    padding: 20px;
    .hero-dashboard-heading {
      font-size: 24px;

      span {
        display: block;
        margin: 10px 0 0;
      }
    }

    .card-group {
      display: block;

      .card {
        border-radius: 8px !important;
        display: block;
        margin: 0 0 10px;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);

        .card-body {
          display: flex;
          align-items: center;
          padding: 14px 16px 15px;
          min-height: 50px;
        }

        .heading {
          margin: 0;
          flex: 1;
          min-height: auto;
          line-height: 18px;

          .info-icon {
            position: relative;
            left: 0;
            top: 0;
            padding-top: 0;
            padding-bottom: 0;

            img {
              width: 16px;
              height: 16px;
            }
          }
        }

        .value {
          font-size: 18px;
          line-height: normal;
        }

        &:nth-child(2),
        &:nth-child(5),
        &:nth-last-child(2) {
          margin-right: 0;
          margin-left: 0;
        }

        &:last-child {
          .card-body {
            padding-top: 7px;
            padding-bottom: 7px;
          }
        }
      }
    }

    .card {
      &.hero-card {
        box-shadow: none;
        margin: 0;
        background: transparent;
        padding: 0 20px;

        .card-body {
          padding-bottom: 0;
        }

        .row {
          flex-direction: column-reverse;

          .recharts-wrapper {
            margin: auto;

            + * {
              left: 0;
              right: 0;
              margin: auto;
            }
          }
        }
      }
    }

    ul {
      margin: 0;
      max-width: none;
    }
  }
  @media screen and (max-width: 575px) {
    .card {
      &.hero-card {
        padding: 0;
      }
    }
  }
`

export const DashboardLink = styled(Link)`
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  font-family: "Quicksand Bold";
  color: #091626;
  margin-bottom: 10px;
`;