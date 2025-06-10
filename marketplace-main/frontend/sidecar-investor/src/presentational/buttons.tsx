import styled from "styled-components";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

export const StyledButton = styled(Button)`
  font-size: 14px;
`

export const SideCarButton = styled(Button)`
  background: ${props => props.theme.palette.common.brandColor};
  border-radius: 20px;
  color: #FFFFFF;
  margin-top: 10px;
  margin-bottom: 20px;
  float: right;
  border: none;
  width: fit-content;
  
  &:hover {
    background: ${props => props.theme.palette.button.hover};
  }
`

export const ButtonCol = styled(Col)`
  display: flex;
  justify-content: center;
`