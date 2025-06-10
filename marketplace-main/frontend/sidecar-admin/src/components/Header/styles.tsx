import styled from "styled-components";

export const Title = styled.h1`
  font-size: 40px;
  font-weight: 700;
  line-height: 60px;
`;

export const SubTitle = styled.h2`
  font-size: 32px;
  line-height: 38px;
  font-weight: 400;
`

export const LeftSideComponentsContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    align-self: flex-start;
    h1, h2, h3, h4, h5, h6 {
        padding-right: 24px;
    }
`;

export const RightSideComponentsContainer = styled.div`
    @media (max-width: 991px) {
        display: none;
    }
`;

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
  @media (max-width: 991px) {
    display: none;
  }
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

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 991px){
    padding-top: 24px;
  }
`;

export const ButtonAndSearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 24px;
  flex: 5;
  button {
    width: fit-content;
    margin: 0px 0px 0px 24px !important;
    padding: 10px 29px !important;
    white-space: nowrap;
    @media (max-width: 576px){
        padding: 10px !important;
    }
  }
  @media (max-width: 991px) {
   flex:2;
  }
`;