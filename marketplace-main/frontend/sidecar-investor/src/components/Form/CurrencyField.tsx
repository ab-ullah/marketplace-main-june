import React, {FunctionComponent} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";
import Row from "react-bootstrap/Row";
import CurrencyFormat from "react-currency-format";

interface FormCurrencyFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur: any;
  value: string | number | string[] | undefined;
  currencySymbol?: string
}


const FormCurrencyField: FunctionComponent<FormCurrencyFieldProps> = (
  {
    label,
    name,
    placeholder,
    onChange,
    onBlur,
    value,
    currencySymbol
  }
) => {
  return <Row className={'mt-2'}>
    <Col md={4} className='field-label'>
      {label}
    </Col>
    <Col md={8}>
      <Form.Group controlId="formFilterValue">
        <CurrencyFormat
          placeholder={placeholder}
          thousandSeparator={true}
          prefix={currencySymbol ? currencySymbol : '$'}
          onValueChange={
            (values) => {
              const {formattedValue, value} = values;
              onChange(name, value)
            }
          }
          onBlur={onBlur}
        />
        <ErrorMessage name={name} component="div"/>
      </Form.Group>
    </Col>
  </Row>
}

export default FormCurrencyField;