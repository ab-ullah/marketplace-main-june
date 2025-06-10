import styled from "styled-components";
import Col from "react-bootstrap/Col";

export const SideCarStyledTable = styled(Col)`
  padding: 20px;
  max-height: 500px;
  overflow: auto;
  border: 1px solid #EBF0F5;
  box-sizing: border-box;
  box-shadow: 0px 100px 80px rgba(172, 175, 198, 0.07), 0px 41.7776px 33.4221px rgba(172, 175, 198, 0.0503198), 0px 22.3363px 17.869px rgba(172, 175, 198, 0.0417275), 0px 12.5216px 10.0172px rgba(172, 175, 198, 0.035), 0px 6.6501px 5.32008px rgba(172, 175, 198, 0.0282725), 0px 2.76726px 2.21381px rgba(172, 175, 198, 0.0196802);
  border-radius: 6px;

  table {
    min-height: 100px;

    .MuiTableRow-head {
      background: ${props => props.theme.palette.common.brandColor};
      color: white;
      font-size: 14px;
      border-radius: 6px;

      th {
        color: #FFFFFF;
        font-weight: 700;
        padding: 11px 9px;
        font-family: Quicksand;
        line-height: 17.5px;
        letter-spacing: 0.02em;
        border-top: 0.5px solid #8499C2;
        border-bottom: none;
        min-height: 50px;
        font-size: 14px;
        word-wrap: break-word;
        max-width: 150px !important;
      }
    }

    tbody {
      tr {
        td {
          color: ${props => props.theme.palette.common.tableTextColor};
          padding: 20px 15px;
          border-top: 0.5px solid #8499C2;
          border-bottom: none;
          line-height: 17.5px;
          letter-spacing: 0.02em;
          font-family: Quicksand;
          font-size: 14px;
          word-wrap: break-word;
          font-weight: 500;

          button {
            background: rgba(72, 128, 255, 0.1);
            border-radius: 27px;
            border: none;
            align-items: center;
            padding: 4px 10px;
            color: #4880FF;
            text-decoration-line: underline;
            font-size: 12px;
            font-weight: 700;
          }

          input {
            background: #F2F3F5;
            border-radius: 4px;
            border: none;
            width: 80%;
          }
        }
      }

      tr.totalRow {
        background: ${props => props.theme.palette.common.highlightColor};

        td {
          font-weight: 700;
          border-top: none;
          color: ${props => props.theme.palette.common.primaryTextColor};
        }

        td:first-child {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }

        td:last-child {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      }

      tr.subRow {
        td:first-child {
          border-top: none;
        }
      }
    }
  }
`

export const NotificationsTable = styled(SideCarStyledTable)`
  table {
    max-height: 500px;
  }
`