import styled from "styled-components";
import { Text } from "./components/InfoTable/styles";
import { Row } from "react-bootstrap";
import { DangerButton, SecondaryButton } from "../../../../../../../styles";

export const StyledRow = styled.div<{alignItems?: string}>`
  display: flex;
  gap: 5px;
  justify-content: space-between;
  align-items: ${(props: any) => props.alignItems ? `${props.alignItems}` : 'center'};

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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DeleteButton = styled(DangerButton)`
  width: auto;
  margin-left: 0px !important;
  height: 47px !important;
  padding: 12px 26px 12px 26px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PaginationWrapper = styled.div`
display:flex;
justify-content: flex-end;
padding-top:20px;
`

export const FieldWrapper = styled.div<{width?: number}>`
  width: ${(props: any) => props.width ? `${props.width}px` : '200px'}
`