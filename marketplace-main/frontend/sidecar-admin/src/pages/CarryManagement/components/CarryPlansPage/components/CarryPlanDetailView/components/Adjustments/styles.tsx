import styled from "styled-components";

export const AllocationValue = styled.div`
    display: flex;
    gap: 4px;
`

export const ButtonsContainer = styled.div`
  text-align: right;
  background: #f5f7f8;
  width: calc(100% + 32px);
  margin-left: -16px;
  margin-bottom: -16px;
  margin-top: 20px;
  padding: 15px 28px;
  border-top: 1px solid #d5dae1;
`;

export const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: fit-content;

  .datepicker {
    margin-right: 2%;
  }

  input {
    background: #ffffff;
    border: 1px solid #d5cbcb;
    box-sizing: border-box;
    border-radius: 8px;
    min-width: 100%;
    padding: 5px;
    font-family: Quicksand;
    font-weight: normal;
    font-size: 16px !important;
  }
`;

export const DeleteIconWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  svg {
    fill: #f00;
    cursor: pointer;
  }
`;