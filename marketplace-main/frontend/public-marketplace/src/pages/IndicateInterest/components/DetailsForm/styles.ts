import styled from "styled-components";
import Form from "react-bootstrap/Form";

import selectedRadio from "../../../../assets/icons/selectedRadio.svg";
import radioButtonIcon from "../../../../assets/icons/radioButton.svg";

export const InterestForm = styled(Form)`
  .form-label {
    font-family: Quicksand;
    font-style: normal;
    font-weight: bold;
    font-size: 15px;
    line-height: 21px;
    color: #020203;
    margin-top: 16px;
    margin-bottom: 0.1rem;

    a {
      text-decoration: none;
      color: #2E86DE;
      cursor: pointer;
      
      :hover {
        color: #2E86DE;
      }
    }

  }

  input {
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
    width: 70%;
  }

  .select__control {
    padding: 6px 16px;
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
    width: 70%;

  }

  .select__value-container {
    padding: 0;
  }

  .select__menu {
    padding: 6px 16px;
    background: #F2F3F5;
    border-radius: 4px;
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 18px;
    line-height: 24px;
    color: #020203;
    width: 70%;
  }

  .css-1okebmr-indicatorSeparator {
    display: none;
  }

  //.submit-button {
  //  background: #470C75;
  //  border-color: #470C75;
  //  border-radius: 70px;
  //  color: #FFFFFF;
  //  padding: 16px 40px;
  //  margin-top: 24px;
  //  margin-bottom: 60px;
  //  font-family: Quicksand;
  //  font-style: normal;
  //  font-weight: bold;
  //  font-size: 24px;
  //  line-height: 30px;
  //}

  .form-check-inline {
    margin-top: 4px;
    border-radius: 4px;
    padding: 8px 12px;


    label {
      line-height: 28px;
      padding-left: 12px;
      font-family: Quicksand;
      font-style: normal;
      font-weight: 500;
      font-size: 18px;
      color: #020203;
    }

    input {
      padding: 0;
      width: 1em;
      height: 1em;
      background-image: url(${radioButtonIcon});
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      background-color: transparent;
      border: none;
      border-radius: 0;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .selectedRadio {
    background: #2E86DE !important;
    color: #FFFFFF !important;
    padding: 8px 12px !important;
    margin-top: 4px !important;

    label {
      line-height: 25px;
      color: #FFFFFF;
    }

    input {
      margin-left: 0;
      margin-top: 0;
      border: none;
      height: 1.15em;
    }

    .form-check-input {
      background-image: url(${selectedRadio});
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      background-color: #2E86DE;
    }
  }

  .helpText {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 17px;
    color: #90A4AE;
    margin-top: 10px;
  }

  .errorText {
    font-family: Quicksand;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 17px;
    color: red;

  }
`

export const CustomLink = styled.span`
  color: #0000ff;
  border-bottom: 1px dotted #0000ff;
  cursor: pointer;
`;

export const BarGraphWrapper = styled.div`
  display: flex;
  color: #fff;
  height: 40px;
  max-width: 800px;
`;

export const BarItem = styled.div<{flexValue: number}>`
  align-items: center;
  justify-content: space-between;
  vertical-align: middle;
  display: flex;
  padding: 0 4px;
  .label{
     font-size: 14px;
    font-weight: 700;
  }
  .value{
    font-size: 14px;
    font-weight: 400;
  }
    
  &.bar-item-0 {
    background-color: #4a47a3;
    flex: ${(props: any) => props.flexValue} 1 20%;
  }
  &.bar-item-1 {
    background-color: #eca106;
    flex: ${(props: any) => props.flexValue} 1 20%;
  }
`;