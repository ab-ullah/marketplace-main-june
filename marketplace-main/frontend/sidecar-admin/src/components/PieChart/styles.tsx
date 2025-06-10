import { handleFormatToCurrency } from "../../utils/currency";
import styled from "styled-components";

const CustomToolTipDiv = styled.div<{ valueColor: string }>`
  background-color: #ffffff;
  padding: 15px;
  border-radius: 20px;
  border: 1px solid black;
  box-shadow: none !important;
  outline: none !important;

  &:focus {
    outline: none !important;
  }
  .label {
    font-family: Quicksand;
    font-weight: bold;
    font-size: 17px;
  }

  .value {
    font-family: Quicksand Medium;
    font-size: 17px;
    margin-left: 5px;
    color: ${(props) => props.valueColor} !important;
  }
`;

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

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  colorMap: Record<string, any>;
}

export const CustomTooltip = ({ active, payload, colorMap }: TooltipProps) => {
  if (active && payload && payload.length) {
    const key = payload[0].payload.key;
    const label = payload[0].payload.label;
    const value = payload[0].value;
    const valueColor = colorMap[key];
    return (
      <CustomToolTipDiv valueColor={valueColor}>
        <div>
          <span className={"label"}>{`${label} :`}</span>
          <span className={"value"}>{handleFormatToCurrency(value)}</span>
        </div>
      </CustomToolTipDiv>
    );
  }
  return null;
};

export const ChartLabel = styled.tspan<any>`
  font-weight: ${(props: any) => props.fontWeight};
  font-size: 14px;
`
