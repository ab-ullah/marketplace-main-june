import styled from "styled-components";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";

export const StyledContainer = styled(Container)`
  font-size: 14px;
`

export const InvestmentDetailContainer = styled(Container)`
  padding: 40px;
`

export const SectionHeading = styled(Col)`
  border-bottom: 0.5px solid rgba(132, 153, 194, 0.3);
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 32px;
  line-height: 42px;
  color: ${props => props.theme.palette.common.sectionHeading};
`