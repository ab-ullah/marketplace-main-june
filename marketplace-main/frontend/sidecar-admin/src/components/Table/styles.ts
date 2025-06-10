import styled from "styled-components";
import { Link } from "react-router-dom";
import "rsuite-table/dist/css/rsuite-table.css";
import { Image } from "react-bootstrap";

export const Wrapper = styled.div<{rowBordered?:boolean}>`
margin: auto;
  width: 100%;
  display: flex;
  .table-container {
    align-items: stretch;
    width: 100%;
    z-index: 0;
  }
  .rs-table {
    border-radius: 0.4em;
  }
  .rs-table-row-header {
    .rs-table-cell {
      background: #413c69;
      div {
        color: #fff;
        font-weight: 700;
        .react-datepicker{
          div{
            color: black !important;
          }
          
        }
      }

 
    }
  }
  .rs-table-row {
    overflow:${props=>props.rowBordered? 'hidden': 'unset'} !important;
    border-bottom: ${props=> props.rowBordered? '1px solid #D5DAE1':'none'} 
  }
  .rs-table-row:last-child {
    border-bottom: none; /* Remove the bottom border for the last row */
  }
  .rs-table-cell {
    overflow: unset !important;
  }
  .dropdown {
    position: unset !important;
  }
  .rs-table-row-header.rs-table-row:hover {
      background: #0d0d0e;
      .rs-table-cell, .rs-table-cell-group {
        background: #413c69;
        div {
          color: #fff;
          font-weight: 700;
        }
      }
    }
    .rs-table-cell-content {
      display: flex;
      align-items: center;
      overflow: unset !important;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }
    .wrap-word{
      .rs-table-cell-content {
        word-break: break-word !important;
      }
    }
    .rs-table-cell-header-sort-wrapper{
      svg{
        fill: white !important;
      }
    }
`;

export const TableLink = styled(Link)`
    color: #020203;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    border-bottom: 1px dotted #666;
`
export const EmptyCell = styled.span`
  border-top: 1px solid #D5DAE1;
  position: absolute;
  top: 0px ;
  padding: 8px 28px;
  width: 100% ;
  font-weight: 700;
  font-size: 16px ;
  line-height: 55px ;
  background: #F5F7F8 ;
  left: 0;
  color: transparent;
`;

export const TooltipIcon = styled(Image)`
  margin-left: 5px;
`