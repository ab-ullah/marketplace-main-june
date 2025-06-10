import { Form } from "formik";
import { Container } from "react-bootstrap";
import styled from "styled-components";



export const IndicateInterestContainer = styled(Container)`
    background: #F0F0F0;
    text-align: left;
    padding: 60px 40px;
    font-weight: 500;
`

export const IndicateInterestFormWrapper = styled.div`
  width: 80%;
  margin-bottom: 40px;

  label {
    font-weight: bold !important;
    font-size: 16px;
  }

  input {
    max-width: 600px !important;
    padding: 12px 16px;
    background: #FFFFFF;
    border: 1px solid #CFD8DC;
    box-sizing: border-box;
    border-radius: 8px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    color: #020203;
    width: 100%;
  }
`

export const LogoImg = styled.img`
  height: 46px;
  margin-right: 10px;
`;

export const StyledForm = styled(Form)`
  label {
    margin: 0
  }
  button {
    background-color: #470C75;
  }
`

export const SuccessMessageWrapper = styled.div`
  color: #020203;
  font-family: 'Inter';
  font-style: normal;
  h1 {
    font-weight: 700;
    font-size: 40px;
    line-height: 60px;

  }
  h4 {
    font-weight: 400;
    font-size: 24px;
    line-height: 36px;
  }
  button {
    background-color: #470C75;
  }
`