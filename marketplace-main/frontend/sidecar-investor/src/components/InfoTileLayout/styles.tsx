import styled from "styled-components";

export const InfoTile = styled.div`
  background: #f8f9fa;
  border: 1px solid #e2e6eb;
  padding: 24px;
  border-radius: 12px;
  gap: 80px;
  height: 100%;
`;

export const InfoValue = styled.h2`
  font-family: Inter;
  font-size: 32px;
  font-weight: 700;
  line-height: 48px;
  letter-spacing: 0em;
  text-align: left;
`;

export const InfoTitle = styled.p`
  font-family: Inter;
  font-size: 20px;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
  color: #607d8b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const SubText = styled.p`
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
  color: #607d8b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  // min-height: 30px;
`;
