import { Modal, Row } from "react-bootstrap";
import styled from "styled-components";

export const FullPageModal = styled(Modal)`
.modal-dialog {
    width: 95vw;
        max-width: 95vw;
}
`

export const Value = styled.h4<{isBold?: boolean}>`
  font-size: 18px;
  font-weight: ${({isBold}) => isBold ? '600' : '400'};
  margin: 0;
`;

export const Label = styled.p`
  font-size: 20px;
  font-weight: 400;
  line-height: 32px;
  color: #607d8b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
`;

export const SubText = styled.p`
  font-size: 14px;
  margin: 0;
`;

export const AllocationCardStatWrapper = styled.div`
  background: #f8f9fa;
  border: 1px solid #e2e6eb;
  padding: 24px;
  border-radius: 12px;
  height: 100%;
`;

export const MultiStatWrapper = styled.div`
  display: flex;
  gap: 16px;
`;

export const CardTopContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const VerticalDivider = styled.div`
  border: 0.5px solid #607d8b;
  height: 45px;
`;

export const AdditionalInfo = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 32px;
  color: #607d8b;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
`;

export const TableContainer = styled(Row)`
  .my-table  {
    height: 300px !important;
  }
`;