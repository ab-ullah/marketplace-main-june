import styled from "styled-components";
import "rsuite-table/dist/css/rsuite-table.css";

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  .table-container {
    align-items: stretch;
    width: 100%;
  }
  .rs-table {
    border-radius: 0.4em;
  }
  .rs-table-cell-header {
    .rs-table-cell-content {
      display:flex !important;
    }
  }
  .rs-table-row-header {
    .rs-table-cell {
      background: ${props => props.theme.palette.common.darkDesaturatedBlueColor};
      div {
        color: #fff;
        font-weight: 700;
      }
    }
  }
  .rs-table-row-header.rs-table-row:hover {
      background: #0d0d0e;
      .rs-table-cell, .rs-table-cell-group {
        background: ${props => props.theme.palette.common.desaturatedBlueColor};
        div {
          color: #fff;
          font-weight: 700;
        }
      }
    }
    .wrap-word{
      .rs-table-cell-content {
        word-break: break-word !important;
      }
    }
`;
