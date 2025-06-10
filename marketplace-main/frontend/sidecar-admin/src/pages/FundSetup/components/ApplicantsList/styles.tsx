import styled from 'styled-components';
import { Link as RouterLink } from "react-router-dom";
import { EligibilityTable } from "../../../../presentational/EligibilityTable";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";

export const ContentInner = styled.div`
 width: 100%;
`;

export const Table = styled(EligibilityTable)`
  table{
    overflow-x: auto;
    white-space: nowrap;
    width: 100%;
  }
  tbody{
    tr{
      td{
        min-width: unset;
      }
    }
  }
`;

export const Link = styled(RouterLink)`
  color: #020203;
  font-weight: 500;
  font-size: 14px;
  display: block;
  padding: 8px 24px 8px 24px;
  width: 180px;
  text-decoration: none;
  &:hover {
    background-color: rgba(46, 122, 222, 0.05);
  }
`

export const PillsWrapper = styled.span<any>`
  color: #FFF;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 2em;
  text-transform: capitalize;
  ${({color}) => `background-color: ${color}`}
`

export const EditApplicantWrapper = styled.div`
  margin-bottom: 24px;
  max-height: calc(100vh - 200px);
  overflow: hidden;
  overflow-y: auto;
  padding: 16px 24px;
  .leverage-radio {
    background: transparent;
    margin-bottom: 5px;
    
    input {
      min-width: 18px !important;
    }
    &.checked {
      background: #2E86DE;
      &.disabled {
        background: #e9ecef;
        label {
          color: #020203;
        }
      }
    }
  }
  .col_job_band {
    .select__control {
      height: auto !important;
    }
  }
`

export const EditApplicantFooter = styled.div`
  margin-bottom: 24px;
  padding: 0 16px 0 16px;
`


export const MenuIconWrapper = styled.div`
  display: inline-block;
  cursor: pointer;
  width: 24px;
`

export const PaginationIcon = styled.div`
    border: 1px solid #B0BEC5;
    display: inline-block;
    border-radius: 2em;
    margin: 0 8px;
    padding: 4px 5px;
    cursor: pointer;
    svg {
      fill: #2E86DE;
    }
    &:hover {
      background-color: rgba(176, 190, 197, 0.2);
    }
    &.disabled {
      opacity: 0;
      cursor: default;
    }
`

export const ButtonWrapper = styled.div`
  float: right;
`

export const FilterImg = styled.img`
  cursor: pointer;
  
`

export const FilterModalFooter = styled(Modal.Footer)`
  justify-content: space-between;
`

export const FilterButtonsWrapper = styled.div`
  align-self: auto;
`

export const EditApplicantStatusCol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
`

export const TransferBadge = styled.span<any>`
  color: #3A8DDF;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 2em;
  text-transform: capitalize;
  background-color: #E4EAF6;
`