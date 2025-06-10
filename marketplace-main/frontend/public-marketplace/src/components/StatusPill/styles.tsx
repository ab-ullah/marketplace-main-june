import styled from "styled-components";
import Form from "react-bootstrap/Form";


export const PillsWrapper = styled.span<any>`
  color: #FFF;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 2em;
  text-transform: capitalize;
  ${({color}) => `background-color: ${color}`}
`


export const Label = styled(Form.Label)`
  font-size: 14px !important;
  font-weight: 700 !important;
  margin-bottom: 0;
`;