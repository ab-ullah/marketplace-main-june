import styled from "styled-components";
import { Text } from "./components/InfoTable/styles";
import { Row } from "react-bootstrap";
import { SecondaryButton } from "../../../../../styles";

export const StyledRow = styled(Row)`
  align-items: center;
  justify-content: space-between;
  // button {
  //   width: auto;
  // }

  input {
    padding: 0.65rem 0.75rem;
  }
`;

export const CountText = styled(Text)`
  font-weight: 600;
`;

export const HelperTextCont = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #556987;
  margin: 0px;
`;

export const SpaceBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 20px;
`;

export const SectionBorder = styled.div`
  margin-top: 36px;
  paddin-top: 36px;
  border-top: 1px solid #e3e7ee;
`;

export const AssignButton = styled(SecondaryButton)`
  width: auto;
  margin-left: 0px !important;
  height: 47px !important;
  padding: 12px 26px 12px 26px !important;
`;

export const PaginationWrapper = styled.div`
display:flex;
justify-content: flex-end;
padding-top:20px;
`