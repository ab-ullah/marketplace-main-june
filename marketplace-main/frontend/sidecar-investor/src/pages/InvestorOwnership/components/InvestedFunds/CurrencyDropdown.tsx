import React, { useEffect } from 'react';
import Select, { OptionTypeBase } from "react-select";
import { setSelectedCurrency } from '../../investorOwnershipSlice';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { useGetCurrencyFeatureFlagQuery } from '../../../../api/rtkQuery/commonApi';
import styled from 'styled-components';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import {selectCurrency, selectInvestorCurrencies} from '../../selectors';

const StyledContainer = styled(Container)`
  padding: 0;
  margin: 0;
`
const LabelCol = styled(Col)`
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 21px;
  letter-spacing: 0.15px;
  color: #393940;
`


const SelectorCol = styled(Col)`
  .select__control {
    font-family: Quicksand Medium;
    padding: 4px 10px;
    background: #FFFFFF;
    font-style: normal;
    font-size: 18px;
    line-height: 24px;
    border-radius: 8px;
    color: ${props => props.theme.palette.common.sectionHeading};
    border: 1px solid #D5CBCB;
  }

  .select__value-container {
    padding: 0;
    border: none;
  }

  .select__indicator-separator {
    display: none;
  }

  .select__menu {
    font-family: Quicksand;
    padding: 14px 16px;
    background: #F2F3F5;
    border-radius: 8px;
    font-style: normal;
    font-weight: normal;
    font-size: 18px;
    line-height: 24px;
    color: ${props => props.theme.palette.common.sectionHeading};
  }

`
//
// const currencyOptions = [{
//     label: "Company Default Currency",
//     value: "company_currency"
// },
// {
//     label: "Fund Currency",
//     value: "fund_currency"
// },
// {
//     label: "Investor Investment Currency",
//     value: "investor_investment_currency"
// },
// {
//     label: "Investor Local Currency",
//     value: "investor_currency"
// }
// ];

const CurrencyDropdown = ({isFullWidth}: {isFullWidth?: boolean}) => {
    const dispatch = useAppDispatch();
    const selectedCurrency = useAppSelector(selectCurrency);
    const availableCurrencies = useAppSelector(selectInvestorCurrencies);



    const { data: currencyFeatureFlag, isLoading } = useGetCurrencyFeatureFlagQuery();

    const onChangeCurrency = (option: OptionTypeBase | null) => {
        dispatch(setSelectedCurrency(option?.value ?? null))
    }

    useEffect(() => {
        if(currencyFeatureFlag?.is_active) {
            dispatch(setSelectedCurrency("fund_currency"))
        }
    }, [currencyFeatureFlag])

    if (isLoading || !currencyFeatureFlag?.is_active) return null;

    let currencyOptions = [
        {
            label: "Fund Currency",
            value: "fund_currency"
        },
        {
            label: "Investor Investment Currency",
            value: "investor_investment_currency"
        },

    ]

    if (availableCurrencies?.company_currency) {
        const companyCurrency = {
            label: `Company Default Currency (${availableCurrencies.company_currency.code})`,
            value: "company_currency"
        }
        currencyOptions = [companyCurrency, ...currencyOptions];
    }

    if (availableCurrencies?.investor_local_currency) {
        const localCurrency = {
            label: `Investor Local Currency (${availableCurrencies.investor_local_currency.code})`,
            value: "investor_currency"
        }
        currencyOptions = [...currencyOptions, localCurrency];
    }

    return <StyledContainer>
        <Row className={'m-0'}>
            <LabelCol md={12}>Currency</LabelCol>
        </Row>
        <Row className={'mt-2 mx-0'}>
            <SelectorCol md={isFullWidth ? 6 : 4}>
                <Select options={currencyOptions}
                    onChange={onChangeCurrency}
                    className="basic-single"
                    classNamePrefix="select"
                    value={currencyOptions.find((opt) => opt.value === selectedCurrency)}
                />
            </SelectorCol>
        </Row>
    </StyledContainer>
}

export default CurrencyDropdown;