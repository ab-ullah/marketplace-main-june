import React, {FunctionComponent} from "react";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";
import CurrencyFormat from "react-currency-format";

interface FormTextFieldProps {
  label: string;
  name: string;
  placeholder: string;
  prefix?: string;
  onChange: any;
  onBlur: any;
  value: string | number | undefined;
  helpText?: string;
  disabled?: boolean;
  hideErrorMessage?: boolean;
}


const CurrencyInput: FunctionComponent<FormTextFieldProps> = (
  {
    label,
    name,
    placeholder,
    prefix,
    onChange,
    onBlur,
    value,
    helpText,
    disabled,
    hideErrorMessage
  }
) => {
  return <Form.Group controlId="formFilterValue" className={'mb-2'}>
    <Form.Label>{label}</Form.Label>
    <div className="currency-field">
    <CurrencyFormat
      placeholder={placeholder}
      thousandSeparator={true}
      prefix={`${prefix} `}
      disabled={disabled}
      onValueChange={
        (values) => {
          const {value} = values;
          onChange(value)
        }
      }
      onBlur={onBlur}
      value={value}
      fixedDecimalScale={!Number.isInteger(value)}
      decimalScale={2}
    />
    </div>
    {!hideErrorMessage && <ErrorMessage name={name} component="div" className={'errorText'}/>}
    {helpText && <div className={'helpText'}>{helpText}</div>}
  </Form.Group>
}

CurrencyInput.defaultProps = {
  prefix: 'USD',
  disabled: false
}
export default CurrencyInput;