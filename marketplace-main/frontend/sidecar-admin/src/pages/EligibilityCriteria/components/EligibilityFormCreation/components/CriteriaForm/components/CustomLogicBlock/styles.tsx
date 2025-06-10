import styled from "styled-components";
import Chip from "@material-ui/core/Chip";

export const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`

export const CustomChip = styled(Chip)<{ bgColor: string, textColor: string }>`
  background: ${props => props.bgColor};
  span {
    color: ${props => props.textColor};
  }
  
  svg {
    fill: ${props => props.textColor};
  }
`