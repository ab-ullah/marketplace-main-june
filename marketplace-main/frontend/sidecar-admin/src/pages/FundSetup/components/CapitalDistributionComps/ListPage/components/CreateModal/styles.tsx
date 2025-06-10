import styled from "styled-components";

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

export const ModalBodyCont = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;