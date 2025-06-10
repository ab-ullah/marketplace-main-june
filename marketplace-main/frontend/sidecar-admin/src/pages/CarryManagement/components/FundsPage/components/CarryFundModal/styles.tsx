import styled from "styled-components";
import { StyledForm } from "../../../../../../presentational/forms";
import { OutlinedButton } from "../../../styles";

export const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 525px;
`;

export const CustomStyledForm = styled(StyledForm)`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const CustomOutlinedButton = styled(OutlinedButton)`
  padding: 12px 26px 12px 26px !important;
`;

export const FormRowWrapper = styled.div`
  display: flex;
  gap: 15px;
`

export const Label = styled.label`
  font-size: 15px;
  font-family: Quicksand;
  font-style: normal;
  font-weight: 700;
  color: #2e2e3a;
`