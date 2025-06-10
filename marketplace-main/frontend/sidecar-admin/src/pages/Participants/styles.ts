import styled from "styled-components";

export const Container = styled.div`
  margin-top: 85px;
  padding: 30px 80px;
  @media (max-width: 991px) {
    padding: 50px 24px;
  }
  .breadcrumb-item > a {
    color: #607d8b;
  }
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 991px) {
    padding-top: 24px;
  }
`;

export const Title = styled.h3`
  font-size: 40px;
  font-weight: 700;
  line-height: 60px;
  flex: 5;
`;

export const StatusPill = styled.div`
  color: ${(props) => props.color};
  border: 2px solid ${(props) => props.color};
  border-radius: 27px;
  background-color: ${(props) => `${props.color}26`};
  box-sizing: border-box;
  padding: 3px 14px;
`;

export const ActionButton = styled.span`
  font-family: "Quicksand";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  text-decoration-line: underline;
  color: #3a8ddf;
  cursor: pointer;
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

