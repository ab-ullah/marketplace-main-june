/* eslint-disable @typescript-eslint/no-explicit-any  */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import styled from 'styled-components'

export const InputBlock=styled.div`
.form-check-input:checked {
    background-color: ${props => props.theme.palette.input.main};
    border-color: ${props => props.theme.palette.input.main};
}
`