import styled from "styled-components";
import { CheckboxBlock as StyledCheckbox } from "../../../../../../../../components/Form/styles";
import { Card } from "react-bootstrap";


export const ModalHeading = styled.span`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 36px;
  color: #020203;
`
export const CustomBlockWrapper = styled.div`
  input[type="text"], textarea {
    max-width: 100% !important;
  }
  .field-label {
    padding-left: 10px !important;
  }
  .form-check {
    margin-left: 10px;
  }
`

export const Checkbox = styled(StyledCheckbox)`
  label {
    display: inline;
  }
`

export const DeleteIcon = styled.div`
  position: absolute;
  display: inline-block;
  right: 12px;
  svg {
    fill: #f00;
  }
`
export const ErrorMessage = styled.p`
  color: #dc3545;
`

export const SmartBlockModalFooter = styled.div<{ justifyEnd: boolean }>`
  display: flex;
  justify-content: ${(props) => props.justifyEnd ? 'end' : 'space-between'};
  margin: 1.5rem 0;
`

export const NestedFieldsCardFooter = styled(Card.Footer)<{ justifyEnd: boolean }>`
  display: flex;
  justify-content: ${(props) => props.justifyEnd ? 'end' : 'space-between'};
  background: none;
  border-top: none;
`