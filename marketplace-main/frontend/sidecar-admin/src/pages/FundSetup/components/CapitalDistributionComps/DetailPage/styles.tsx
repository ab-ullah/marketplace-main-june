import { Button } from "react-bootstrap";
import styled from "styled-components";

export const TopRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
`;

export const IconButton = styled(Button)`
  color: #4a47a3 !important;
  border-color: #4a47a3 !important;

  display: flex;
  gap: 9px;
  align-items: center;
  font-family: "Quicksand";
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 20px;

  :focus-visible {
    border: none !important;
    outline: none !important;
  }

  :focus {
    box-shadow: none !important;
  }

  :hover {
    background: transparent !important;
  }

  &:not(.hover):hover {
    color: white;
    background: #4a47a3;
  }
`;

export const BackButton = styled(IconButton)`
  border: none !important;
  background: transparent !important;
`;

export const ApproveButton = styled(IconButton)`
  background: #4a47a3 !important;
  color: white !important;
  :hover {
    color: #4a47a3 !important;
  }
`;

export const RowItem = styled.div`
  display: flex;
  gap: 9px;
  align-items: cnter;
`;

export const Title = styled.p`
  width: 100%;
  font-family: "Quicksand";
  font-style: normal;
  font-weight: 500;
  line-height: 52px;
  font-size: 28px;
  margin: 0px;
  width: fit-content;
`;

export const AmountCell = styled.div`
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  gap: 10px;

  background: #ffffff;

  border: 1px solid #d5dae1;
  border-radius: 100px;

  span {
    font-family: "Inter";
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;
  }
`;

export const Text = styled.p`
  font-family: "Quicksand";
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  margin: 0px;
`;

export const DocTile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: left;
  cursor: pointer;

  position: absolute;
  left: 8px;

  .doc-name{
    max-width: 170px;
  }

  span {
    font-family: "Inter";
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;

    color: #3a8ddf;
  }
`;
