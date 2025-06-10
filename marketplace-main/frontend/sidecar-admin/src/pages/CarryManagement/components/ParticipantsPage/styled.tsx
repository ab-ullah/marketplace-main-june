import { Badge } from "react-bootstrap";
import styled from "styled-components";

export const Label = styled.h4`
  font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0em;
  text-align: left;
`;

export const StyledBadge = styled(Badge)`
  display: ${props => props.status ? 'block' : 'none'};
  background-color: ${props => props.status === 'active' ? '#E6F4EE' : '#FCEEEA'};
  color: ${props => props.status === 'active' ? '#10AC84' : '#FF5722'}
`
