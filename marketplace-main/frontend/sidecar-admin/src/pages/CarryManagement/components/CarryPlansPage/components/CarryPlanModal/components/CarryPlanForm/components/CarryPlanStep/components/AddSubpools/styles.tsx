import styled from "styled-components";

export const DeleteIconWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  svg {
    fill: #f00;
    cursor: pointer;
  }
`;

export const PoolCont = styled.div`
  padding: 16px;
  border-radius: 8px;
  border: 1px;
  opacity: 0px;
  border: 1px solid #c1cee9;
  margin: 20px 0 20px 0;
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

export const Title = styled.div`
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
`;

export const Cont = styled.div`
  padding: 20px 0 20px 0;
  border-top: 1px solid #e3e7ee;
  border-bottom: 1px solid #e3e7ee;
`;

export const HelperTextCont = styled.p`
font-weight: 400;
font-size: 12px;
line-height: 20px;
color: #556987;
margin: 0px;
`