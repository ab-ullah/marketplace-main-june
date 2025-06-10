import styled from 'styled-components';
import Accordion from 'react-bootstrap/Accordion';
import { Button as BSButton } from 'react-bootstrap';
import { Form as BaseForm } from "formik";
import { Link as ReactScrollLink } from 'react-scroll';
import {CustomButton} from "../../components/Button/ThemeButton/styled";

export const Container = styled.div`
  background-color: #ECEFF1;
  min-height: calc(100vh - 78px);
  @media screen and (max-width: 1199px){
  }
  @media (max-width: 655px){
    min-height: calc(100vh - 64px);
  }
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding:0px;
`;

export const ScrollLink = styled(ReactScrollLink)`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const Header = styled.div`
  align-items: center;
  background-color: white;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 40px 0px;
  transition: all 0.2s ease-in-out;
  width: 100%;
  z-index: 10;
  h1{
    margin: 0px;
  }
  @media screen and (max-width: 1199px){
    padding-left: 20px;
    padding-right: 20px;
  }
`;

export const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export const Tab = styled(({ active, ...props }) => <div {...props} />)`
  border-bottom: 4px solid transparent;
  border-bottom-color: ${({ active }) => active ? '#2E86DE' : 'transparent'};
  cursor: pointer;
  font-family: 'Quicksand Medium';
  padding-bottom: 12px;
  margin-right: 48px;
  transition: all 0.2s ease-in-out;
  :last-child{
    margin-right: 0px;
  }
  @media (max-width: 767px){
    margin-right: 20px;
  }
`;

export const TabRow = styled.div`
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

export const Title = styled.h1`
  font-size: 40px;
  font-family: 'Inter';
  font-weight: 700;
  margin-bottom: 15px !important;
  @media (max-width: 575px){
    font-size: 32px;
  }
`;

export const Subtitle = styled.h3`
  font-size: 24px;
  font-family: 'Inter';
`;

export const Path = styled.span`
  color: #90A4AE;
`;

export const SubmitButton = styled(BSButton)`
  background-color: #470C75;
  border-radius: 70px;
  border-color: transparent;
  font-family: 'Quicksand Medium';
  margin-bottom: 16px;
  padding: 10px 30px;
  transition: all 0.3s ease;
  :hover{
    background-color: #470C75;
    border-color: #470C75;
  }
  :disabled{
    background-color: #CFD8DC;
    border-color: #CFD8DC;
  }
  @media (max-width: 575px){
    font-size: 14px;
    margin-bottom: 8px;
    padding: 10px;
  }
`;

export const WithdrawButton = styled(SubmitButton)`
  background-color: #9C1D1D;
  :hover{
    background-color: #9C1D1D;
  }
`

export const SubmitChangesButton = styled(SubmitButton)`
  font-family: 'Quicksand Medium';
  margin-bottom: 16px;
  padding: 10px 30px;
  transition: all 0.3s ease;
  
  background-color: #0A6B3D;
  :hover{
    background-color: #0A6B3D;
  }
`

export const LeftSidebar = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 40px;
  transition: all 0.3s ease;
  width: 378px;
  @media screen and (max-width: 1199px){
    padding-left: 20px;
    padding-right: 20px;
  }
  @media (max-width: 575px){
    display: none;
  }
`;

export const SidebarItem = styled(({ active, ...props }) => <div {...props} />)`
 align-items: center;
 color: ${({ active }) => active ? '#2E86DE' : '#020203'};
 display: flex;
 flex-direction: row;
 padding-bottom: 24px;
 transition: all 0.3s ease;
 > a {
   color: inherit;
   text-decoration: none;
 }
`
;

export const SidebarSubItem = styled(SidebarItem)`
  padding-left: 24px;
`;

export const CommentContainer = styled.div`
  background-color: #FCF1EA;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  margin-top: 4px;
  padding: 8px;
  width: 100%;
  margin-bottom: 4px;
`;

export const CommentNote: any = styled.div`
  padding: 4px;
`

export const CommentBadge: any = styled.div`
  background-color: ${(props: any) => props.color ? props.color : "#E37628"};
  border-radius: 27px;
  color: white;
  font-family: 'Quicksand Medium';
  padding: 4px 15px;
  width: fit-content;
  font-weight: 700;
  height: 30px;
`;

export const SidebarBadge = styled(CommentBadge)`
  align-items: center;
  background-color: ${(props: any) => props.color ? props.color : "#CF7500"};
  display: flex;
  flex-direction: row;
  font-family: 'Quicksand Medium';
  font-size: 12px;
  margin-left: 16px;
  transition: all 0.3s ease;
  padding: 4px 10px;
  width: fit-content;
  white-space: nowrap;
`;

export const Flag = styled.div`
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcuMjA3NCAzLjUwMDY1TDcuNDQwNzMgNC42NjczMkgxMC40OTc0VjguMTY3MzJIOC41Mzc0TDguMzA0MDYgNy4wMDA2NUg0LjA4MDczVjMuNTAwNjVINy4yMDc0Wk04LjE2NDA2IDIuMzMzOThIMi45MTQwNlYxMi4yNTA3SDQuMDgwNzNWOC4xNjczMkg3LjM0NzRMNy41ODA3MyA5LjMzMzk4SDExLjY2NDFWMy41MDA2NUg4LjM5NzRMOC4xNjQwNiAyLjMzMzk4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==');
  height: 14px;
  margin-right: 2px;
  width: 14px;
`;

export const Inner = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: row;
  flex: 1;
  width: 100%;
`;


export const Content = styled.div`
  padding: 16px 56px;
  transition: padding 0.3s ease;
  width: 100%;
  @media (max-width: 767px){
    padding: 16px 20px;
  }
`;

export const FormContainer = styled.div`
background-color: #fff;
  border-radius: 4px;
  max-width: 984px;
  margin: 0 auto;
  padding: 64px 126px;
  transition: all 0.3s ease;
  @media screen and (max-width: 767px){
    padding: 44px;
  }
  @media (max-width: 479px){
    padding: 20px;
  }
  form{
    margin: 0 auto;
    max-width: 732px;
    width: 100%;
  }
  textarea{
    font-size: 15px;
  }
  h3{
    font-size: 24px;
    margin-top: 12px;
    margin-bottom: 0px;
    :first-child{
      margin-top: 0px;
    }
  }
  .col-md-8{
    width: 100%;
    .row{
      margin-left: 0px;
    }
    input{
      font-size: 15px;
    }
    .select__value-container {
      font-size: 15px;
    }
  }
  .MuiDropzoneArea-root{
    border: 1px dashed #D5CBCB;
    min-height: unset;
    padding-bottom: 24px;
    padding-top: 24px;
    .MuiDropzoneArea-text{
      color:#2E86DE;
      font-family: 'Quicksand';
      font-size: 16px;
      font-weight: 500;
      margin: 0px;
      padding-bottom: 18px;
    }
  }
  .field-label{
    font-family: 'Quicksand Bold';
    width: 100%;
  }
  .field-label-auto{
    font-family: 'Quicksand Bold';
    width: 20%;
  }
  .form-check-inline{
    align-items: center;
    background: rgba(241, 241, 241, 0.89);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    margin-top: 4px;
    margin-bottom: 4px;
    padding: 12px;
    width: fit-content;
    transition: all 0.2s ease-in-out;
    .form-check-input {
      border: 1px solid #78909C;
    }
    input {
      cursor: pointer;
      height: 18px;
      margin: 0px;
      width: 18px;
    }
    label{
      cursor: pointer;
      padding-left: 8px;
    }
    &.selectedRadio {
      background: #2E86DE;
      color: #FFFFFF;

      .form-check-input {
        border-color: white;
      }
    }
  }
  background-color: unset;
  padding: 0px;
  h3{
    font-size: 24px;
    font-family: 'Inter';
  }
  .col-md-4{
    width: unset;
  }
`;

export const CardContainer = styled.section`
  padding: 0px 0px 24px 0px;
`;

export const DocumentsList = styled.section`
  padding: 30px 0px;
`;

export const FakeLink: any = styled.span`
  cursor: ${(props: any) => props.disableLink ? 'not-allowed' : 'pointer'};
  color: blue;
  text-decoration: underline;
  &:hover {
    color: purple !important;
  }
`;

export const TaxRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  text-align: left;
  width: 100%;
  padding: 2px 0px;
`;

export const SubTitle = styled.h3`
  padding-bottom: 10px;
`;

export const CenterMiddleColumn = styled.div`
  width: 40%;
  text-align: left;
`; 

export const ParticipantContainer = styled(Accordion)`
  .accordion-item{
    background-color: transparent;
    .accordion-header{
      background-color: transparent;
    }
    .accordion-body{
      padding: 0px ;
    }
    .accordion-button{
      background-color: #413C69;
      border-radius: 4px;
      color: white;
      font-family: 'Quicksand Medium';
      ::after{
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23ffffff'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
      }
    }
  }
`;

export const ChangeAnswersButton = styled.div`
  color: #2E86DE;
  cursor: pointer;
  text-decoration: underline;
  display: inline-block;
`;

export const Form = styled(BaseForm)`
  margin: 0 !important;
`

export const DismissButton = styled.span`
  cursor: pointer;
  padding-left: 97%;
`

export const OverviewWrapper = styled.div`
  padding: 0 25% 3% 0px;
`