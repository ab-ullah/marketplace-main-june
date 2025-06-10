import { Col } from "react-bootstrap";
import styled from "styled-components";

export const GappedCol = styled(Col)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
`;

export const StyledTitle = styled.p`
  padding-bottom: 12px;
  margin-bottom: 12px;
  width: 100%;
  border-bottom: 1px solid #d4cbcb;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
`;
