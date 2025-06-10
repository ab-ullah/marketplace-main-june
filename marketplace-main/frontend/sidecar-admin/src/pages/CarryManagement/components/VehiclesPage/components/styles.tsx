import { Button, FormLabel } from "react-bootstrap";
import styled from "styled-components";


export const StyledCheckboxLabel = styled(FormLabel)`
    font-size: 18px;
    margin-left: 10px;
`

export const HeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
`

export const StyledButton = styled(Button)`
    height: 40px;
    svg {
    fill: #470C75;
    width: 0.75em;
    margin-right: 3px;
  }
  &:hover {
    svg {
        fill: #fff;
      }
`

export const TabsWrapper = styled.div`
    display: flex;
    background: rgb(245, 247, 248);
    border-bottom: 1px solid #DFE5ED;
`

export const FormFieldsWrapper = styled.div`
    padding: 1rem;
`