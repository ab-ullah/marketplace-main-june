import styled from "styled-components";

export const StyledRow = styled.div<{alignItems?: string}>`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: ${(props: any) => props.alignItems ? `${props.alignItems}` : 'center'};

  input {
    padding: 0.65rem 0.75rem;
  }
`;

export const FieldWrapper = styled.div<{width?: number}>`
  width: ${(props: any) => props.width ? `${props.width}px` : '200px'}
`

export const DeleteIconWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  svg {
    fill: #f00;
    cursor: pointer;
  }
`;

export const AddButton = styled.span`
  cursor: pointer;
  color: #4a47a3;
  font-family: Quicksand;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-align: left;
`;

export const AllocationsCont = styled.div`
  padding: 16px;
  border-radius: 8px;
  border: 1px;
  opacity: 0px;
  border: 1px solid #c1cee9;
  margin: 20px 0 20px 0;
`;