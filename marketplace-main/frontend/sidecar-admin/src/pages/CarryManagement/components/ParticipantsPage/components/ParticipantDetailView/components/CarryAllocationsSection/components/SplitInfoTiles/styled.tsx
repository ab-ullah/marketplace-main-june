import styled from "styled-components";

export const InfoCont = styled.div`
  border-bottom: 1px solid #e2e6eb;
  margin-top:24px;
  :last-child {
    border:none;
    margin-bottom: -20px;
  }
  :first-child {
    margin-top: 0px;
  }
`;

export const InfoTile = styled.div`
  background: #f8f9fa;
  border: 1px solid #e2e6eb;
  padding: 24px;
  border-radius: 12px;
  justify-content: space-between;
  display:flex;
  flex-direction: column;
  margin-bottom: 36px;
  width: 33%;
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
