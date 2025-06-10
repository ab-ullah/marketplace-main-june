import { Link } from "react-router-dom";
import styled from "styled-components";
// import { Button as BSButton } from "react-bootstrap";
// import Col from "react-bootstrap/Col";

export const Container = styled.div`
  background-color: #ECEFF1;
  margin-top: 82px;
  min-height: calc(100vh - 60px);
  @media (max-width: 655px){
    min-height: calc(100vh - 64px);
  }
`;

export const Header = styled.div`
  align-items: center;
  background-color: white;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 80px 0px;
  transition: all 0.2s ease-in-out;
  width: 100%;
  z-index: 10;
  h1{
    margin: 0px;
  }
  @media screen and (max-width: 991px){
    padding-left: 20px;
    padding-right: 20px;
  }
`;

export const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
`;

export const BigTitle = styled.h1`
  color: #212121;
  font-size: 40px;
  font-family: 'Inter';
  font-weight: 700;
  margin: 0 auto;
  transition: all 0.3s ease;
  &>span {
    position: relative;
    bottom: 8px;
    left: 10px;
  }
`;

export const ButtonRow = styled.div`
  width: 100%;
  align-items: center;
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;
  padding-bottom: 26px;
  .btn{
    border-radius: 70px;
    font-family: 'Quicksand Medium' !important;
    margin-right: 16px;
    padding: 10px 30px;
    @media (max-width: 767px){
      padding: 10px;
    }
    &:last-child{
      margin-right: 0px;
    } 
  }
`;

export const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`