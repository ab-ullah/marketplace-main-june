import styled from "styled-components";
import Button from "react-bootstrap/Button";
import { ThemeButton } from "../../../../components/Button/styles";

export const FormContent = styled.div`
    font-size: 19px;
    font-weight: 900;
    text-align: left;

`

export const EligibilityInterestForm = styled.div`
    padding-top: 24px;
    .interest-form{
        background: #FFF;
        padding: 0;
        input[type="text"], select, .select__control{
            width: 100%;
        }
    }
  
    .custom-radio-buttons {
      .form-check-inline {
        padding: 8px !important;
        label {
          display: flex !important;
        }
        input {
          padding: 8px !important;
        }
      }
    }
`

export const NextButton = styled(ThemeButton)`
    margin-right: 20px;
    margin-bottom: 8px;
`

export const WideNextButton = styled(ThemeButton)`
  padding: 16px 40px;
`


export const FinalInvestmentAmountDiv = styled.div`
  padding: 0;
  background: inherit;
  width: 100%;
`

export const TotalGrossCommmitCont = styled.div`
  background: #F8F9FA;
  width: 100%;
  height: 100%;
  padding: 35px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
export const BoldCurrency = styled.h3`
  font-weight: bold;
  font-family: 'Inter';
  font-size: 30px;
`

export const CurrencyTitle = styled.p`
  margin: 0 !important;
  margin-bottom: 10px important;
  font-family: 'Inter';
  font-weight: 500;
`