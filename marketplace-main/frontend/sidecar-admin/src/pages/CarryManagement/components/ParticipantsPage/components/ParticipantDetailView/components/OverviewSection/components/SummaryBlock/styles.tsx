import styled from "styled-components";

export const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export const TileCont = styled.div`
  width: 277px;
  height: 172px;
  padding: 25.2px 21.6px;
  border-radius: 12px;
  gap: 16px;
  background-color: #f5f7f8;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const Label = styled.p`
  font-family: Inter;
  font-size: 14.4px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0em;
  text-align: left;
  margin: 0px;
`;

export const Amount = styled.h4`
  font-family: Inter;
  font-size: 21.6px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
`;

export const SplitInfoCont = styled.div`
  display: flex;
  
  div {
    padding-right: 9px;
    border-right: 1px solid #CFD8DC;
    :last-child {
      padding-right: 0px;
      border-right: none;
      padding-left: 18px;
    }
  }
`;

export const BenefitsWrapper = styled.div`
  width: 277px;
  height: auto;
  padding: 25.2px 21.6px;
  border-radius: 12px;
  gap: 16px;
  background-color: #f5f7f8;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const BenefitWrapper = styled.div`
    display: flex;
    flex-flow: wrap;
    gap: 10px;


  div {
    min-width: 100px;
    padding-right: 9px;
    border-right: 1px solid #CFD8DC;
    margin-bottom: 15px;
    :last-child {
      padding-right: 0px;
      border-right: none;
    }
  }
`;
