import styled from "styled-components";
import {Link} from "react-router-dom";
import { Col, Container } from "react-bootstrap";

export const FundDetailLink = styled(Link)`
  float: left;
  text-decoration: none;
  color: ${props => props.theme.palette.common.tableTextColor};
`

export const FundInvestmentLinks = styled(Link)`
  float: right;
  text-decoration: none;
  margin-left: 10px;
`
export const Title = styled.h3`
  font-size: 40px;
  font-weight: 700;
  line-height: 60px;
  flex:5;
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


export const HideShowSection: any = styled.div`
  visibility: ${(props: any) => props.visible ? "show" : "hidden"};
`;

export const Clickable = styled.span`
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

export const LabelCol = styled(Col)`
  font-size: 25px !important;
  font-weight: 700 !important;
  line-height: 21px;
  padding-bottom: 6px;
`;

export const TabsCont =styled(Container)`
padding-left: 0px;
padding-right: 0px;
.nav-tabs{
  background: transparent !important;
}
.nav-link.active{
  background: transparent !important;
}

`

export const DisableDiv = styled.div<{disabled?:boolean}>`
  opacity: ${(props: any) => (props.disabled ? 0.5 : 1)};
  cursor: ${(props: any) => (props.disabled ? "not-allowed" : "pointer")};
`;