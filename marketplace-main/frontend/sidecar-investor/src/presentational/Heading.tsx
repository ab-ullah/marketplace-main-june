import styled from "styled-components";

export const Heading = styled.h4`
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  font-size: 32px;
  line-height: 48px;
  color: ${props => props.theme.palette.common.primaryTextColor};
`

export const InlineBlockHeading = styled(Heading)`
  display: inline-block;
`