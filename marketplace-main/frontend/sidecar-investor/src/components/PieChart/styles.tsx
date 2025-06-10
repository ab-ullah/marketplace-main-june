import styled from "styled-components";

export const CenterSection = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  textalign: center;
  zindex: 2;

  .label {
    font-family: Quicksand;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0.02em;
    text-align: center;
  }

  .value {
    font-family: Inter;
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
    letter-spacing: 0em;
    text-align: center;
    margin: 0;
  }
`;

export const CenterTitle = styled.p`
  font-family: Quicksand;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.02em;
  text-align: center;
`;

export const CenterValue = styled.p`
  font-family: Inter;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: center;
  margin: 0;
`;

export const ChartLabel = styled.tspan<any>`
  font-weight: ${(props: any) => props.fontWeight};
  font-size: 14px;
`
