import styled from "styled-components";
import {Table} from "react-bootstrap";

export const EligibilityTable = styled(Table)`
  box-shadow: 0 76px 74px rgba(0, 0, 0, 0.03);

  thead {
    background: ${props => props.theme.palette.eligibilityTheme.purple};

    th {
      border: 0;
      color: #fff;
      font-family: 'Quicksand Bold';

      &:first-child {
        border-top-left-radius: 8px;
      }

      &:last-child {
        width: 60px;
        border-top-right-radius: 8px;
      }
    }
  }

  thead th,
  tbody tr td {
    padding: 15px 20px;
    vertical-align: middle;
    height: 50px;
  }

  tbody {

    tr {

      td {
        background: #fff;
        border-bottom: 1px solid #ebeef0;
        font-size: 14px;
        min-width: 120px;

        
      }

      &:last-child {

        td {
          border: 0;

          &:first-child {
            border-bottom-left-radius: 8px;
          }

          &:last-child {
            border-bottom-right-radius: 8px;
          }
        }
      }
    }
  }


`