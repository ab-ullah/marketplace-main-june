import styled from "styled-components";
import {handleFormatToCurrency} from "../../utils/currency";
import {get} from "lodash";

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

interface TooltipProps {
    active?: boolean;
    payload?: any[];
    colorMap: Record<string, any>;
}

export const CustomTooltip = ({active, payload, colorMap}: TooltipProps) => {
    if (active && payload && payload.length) {
        const key = get(payload[0], "payload.key");
        const label = get(payload[0], "payload.label");
        const value = get(payload[0], "value");
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