import React, {FunctionComponent} from "react";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";

interface FormTextFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur?: any;
  value: string | number | string[] | undefined;
  helpText?: string;
  hideErrorMessage?: boolean
}


const TextInput: FunctionComponent<FormTextFieldProps> = (
  {
    label,
    name,
    placeholder,
    onChange,
    onBlur,
    value,
    helpText,
    hideErrorMessage
  }
) => {
  return <Form.Group controlId={name} className={'mb-2 mt-2'}>
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="text"
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
    />
    {!hideErrorMessage && <ErrorMessage name={name} component="div" className={'errorText'}/>}
    {helpText && <div className={'helpText'}>{helpText}</div>}
  </Form.Group>
}

export default TextInput;