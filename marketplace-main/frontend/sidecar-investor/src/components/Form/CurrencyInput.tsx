import React, {FunctionComponent} from "react";
import CurrencyFormat, {Values} from "react-currency-format";
import styled from "styled-components";

interface CurrencyInputProps {
  name: string;
  placeholder: string;
  onChange: any;
  value: string | number | string[] | undefined;
  symbol?: string;
}

const StyledCurrencyFormat = styled(CurrencyFormat)`
  padding: 10px;
`

const CurrencyInput: FunctionComponent<CurrencyInputProps> = (
  {
    name,
    placeholder,
    onChange,
    value,
    symbol
  }
) => {
  return <StyledCurrencyFormat
    placeholder={placeholder}
    thousandSeparator={true}
    prefix={symbol ? symbol : '$'}
    value={value}
    onValueChange={
      (values: Values) => {
        const {value} = values;
        onChange(name, value)
      }
    }
  />
}

export default CurrencyInput;