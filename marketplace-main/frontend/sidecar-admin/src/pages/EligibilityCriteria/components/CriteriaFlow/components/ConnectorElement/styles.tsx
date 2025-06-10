import styled from "styled-components";
import get from "lodash/get";

export const CONDITION_COLOR = {
  OR: '#FF5722',
  AND: '#2E86DE',
  CUSTOM: '#5A9D32FF'
}

export const BlockFlowElement = styled.div<{ operator: string }>`
  background: transparent;
  
  .select__indicator-separator{
    display: none;
  }
  
  .select__control {
    background: ${p => get(CONDITION_COLOR, p.operator)};
    border-color: ${p => get(CONDITION_COLOR, p.operator)} !important;
    border-radius: 27px;
    box-shadow: none;
    
    .select__single-value {
      color: #FFFFFF;
      font-family: Quicksand;
      font-style: normal;
      font-weight: bold;
      font-size: 12px;
      line-height: 15px;
    }
    
    svg {
      fill: #ffffff;
    }

  }
`