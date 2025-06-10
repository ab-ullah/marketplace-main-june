import styled from "styled-components";

export const InputContainer = styled.div`
  min-width: 253px;
  padding: 10px 14px 10px 14px;
  gap: 8px;
  border-radius: 8px;
  border: 1px;
  opacity: 0px;
  background: #ffffff;
  border: 1px solid #d5dae1;
  box-shadow: 0px 1px 2px 0px #0000000d;
  display: flex;
  align-items: center;
  cursor: pointer;

  input {
    background: transparent;
    border: none;
    width: 100%;
    cursor: pointer;
    &:focus-visible {
      outline: none;
    }
  }
`;

export const DatePickerCont = styled.div`
  position: absolute;
  z-index: 105;
`;
