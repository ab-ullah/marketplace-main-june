import styled from "styled-components";

export const FilterBox: any = styled.div`
  align-items: center;
  background-color: white;
  border: 1px solid #D5CBCB;
  border-radius: 8px;
  color: #B0BEC5;
  display: flex;
  justify-content: space-between;
  height: 48px;
  padding: 0px 16px;
  min-width: fit-content;
  width: 100%;
  max-width:340px;
  svg{
    margin-left: 8px;
  }
  // @media (max-width: 991px) {
  //   display: none;
  // }
`;

export const InputBox: any = styled.input`
  border: none;
  background-color: transparent;
  font-size: 14px;
  font-weight: 500;
  padding: 0px;
  width: 100%;
  height: 100%;
  &::placeholder{
    color: #B0BEC5;
  }
  &:focus{
    outline: none;
  }
`;

export const ButtonAndSearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 5;
  button {
    width: fit-content;
    margin: 0px 0px 0px 24px !important;
    padding: 15px 29px !important;
    white-space: nowrap;
  }
  @media (max-width: 991px) {
   flex:2;
  }
`;