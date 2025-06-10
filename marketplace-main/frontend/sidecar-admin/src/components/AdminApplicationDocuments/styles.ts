import styled from "styled-components";

export const ButtonsContainer = styled.div`
  text-align: right;
`;


export const TableContainer = styled.div`
  height: 550px;

  .table-container {
    min-height: 450px !important;
    height: 450px !important;
  }
`;

export const DocTitle = styled.div`
  color: #020203;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  -webkit-text-decoration: none;
  text-decoration: none;
  border-bottom: 1px dotted #666;
  display: inline-block;
`;

export const DeleteIconWrapper = styled.div`
  svg {
    fill: #F00;
    cursor: pointer;
  }
`;
