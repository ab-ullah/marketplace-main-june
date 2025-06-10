import styled from "styled-components";

export const PillButton = styled.button`
  width: max-content;
  padding: 8px 16px 8px 16px;
  border-radius: 70px;
  gap: 4px;
  color: #4a47a3;
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
