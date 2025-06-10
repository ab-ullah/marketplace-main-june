import React, {FunctionComponent, useMemo, useState} from "react";
import Form from "react-bootstrap/Form";
import _ from 'lodash';
import styled from "styled-components";
import CurrencyFormat, {Values} from "react-currency-format";


const StyledCurrencyFormat = styled(CurrencyFormat)`
  background: #FFFFFF;
  border: 1px solid #D5CBCB;
  box-sizing: border-box;
  border-radius: 8px;
  min-width: 100%;
  padding: 15px;
  font-family: Quicksand;
  font-weight: normal;
  font-size: 16px !important;
`


interface APISyncCurrencyFieldProps {
  name: string;
  placeholder: string;
  onChange: any;
  value: string | number | string[] | undefined;
  isNumber?: boolean;
}


const APISyncCurrencyField: FunctionComponent<APISyncCurrencyFieldProps> = (
  {
    name,
    placeholder,
    onChange,
    value,
    isNumber
  }
) => {
  const [decimalValue, setDecimalValue] = useState(value);

  const debouncedOnChange = useMemo(
    () => _.debounce(onChange, 2000)
    , []);


  const localOnChange = (value: any) => {
    setDecimalValue(value)
    debouncedOnChange(value)
  }

  return <>
    <Form.Group controlId="formFilterValue" className={'mb-4'}>
      <StyledCurrencyFormat
        placeholder={placeholder}
        thousandSeparator={true}
        prefix={'$'}
        value={decimalValue}
        onValueChange={
          (values: Values) => {
            const {value} = values;
            localOnChange(value)
          }
        }
      />
    </Form.Group>
  </>
}

export default APISyncCurrencyField;