import styled from "styled-components";

export const CarryExportWrapper = styled.div`
    display: flex;
    gap: 35px;
    align-items: center;
    .date-container {
        width: 150px;
    }
`

export const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: row;
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

export const PillButton = styled.button`
  width: max-content;
  padding: 8px 16px 8px 16px;
  border-radius: 70px;
  gap: 4px;
  color: #4a47a3;
  height: 45px;
  border: 2px solid #4a47a3;
  font-family: Quicksand Bold;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  letter-spacing: 0.02em;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;