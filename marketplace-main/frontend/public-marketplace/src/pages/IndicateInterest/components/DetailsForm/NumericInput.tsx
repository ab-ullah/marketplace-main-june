import React, {FunctionComponent} from "react";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";

interface FormTextFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur: any;
  value: string | number | string[] | undefined;
  helpText?: string;
}


const NumericInput: FunctionComponent<FormTextFieldProps> = (
  {
    label,
    name,
    placeholder,
    onChange,
    onBlur,
    value,
    helpText
  }
) => {
  return <Form.Group controlId="formFilterValue" className={'mb-2'}>
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="number"
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
    />

    <ErrorMessage name={name} component="div" className={'errorText'}/>
    {helpText && <div className={'helpText'}>{helpText}</div>}
  </Form.Group>
}

export default NumericInput;