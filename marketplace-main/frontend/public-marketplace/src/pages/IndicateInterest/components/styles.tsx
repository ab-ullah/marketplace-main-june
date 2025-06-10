import styled from "styled-components";
import Button from "react-bootstrap/Button";

export const FormContent = styled.div`
    font-size: 16px;
    font-weight: 500;
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
`

export const NextButton = styled(Button)`
    margin-right: 20px;
    margin-bottom: 8px;
`


export const FinalInvestmentAmountDiv = styled.div`
  padding: 0;
  background: inherit;
  width: 100%;
`