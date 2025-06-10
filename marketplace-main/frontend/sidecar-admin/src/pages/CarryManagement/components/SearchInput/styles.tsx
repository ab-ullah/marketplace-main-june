import styled from "styled-components";

export const FilterBox: any = styled.div`
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e2e6eb;
  border-top: none;
  border-bottom: none;
  color: #b0bec5;
  display: flex;
  justify-content: space-between;
  min-height: 60px;
  padding: 0px 16px;
  min-width: fit-content;
  width: 100%;
  svg {
    margin-right: 8px;
    fill: #abb0b8;
  }
`;

export const InputBox: any = styled.input`
  border: none;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  padding: 0px;
  width: 100%;
  height: 100%;
  &::placeholder {
    color: #b0bec5;
  }
  &:focus {
    outline: none;
  }
`;