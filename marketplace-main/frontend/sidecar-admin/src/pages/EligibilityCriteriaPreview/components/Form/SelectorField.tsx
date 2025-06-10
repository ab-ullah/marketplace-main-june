import React, {FunctionComponent} from "react";
import Form from "react-bootstrap/Form";
import Select, {OptionTypeBase} from "react-select";
import {ErrorMessage} from "formik";

interface FormSelectorFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur?: any;
  value: OptionTypeBase | readonly OptionTypeBase[] | null | undefined;
  options: OptionTypeBase[];
  helpText?: string;
  hideErrorMessage?: boolean;
}


const SelectorInput: FunctionComponent<FormSelectorFieldProps> = (
  {
    label,
    name,
    placeholder,
    onChange,
    value,
    options,
    onBlur,
    helpText,
    hideErrorMessage,
  }
) => {
  return <Form.Group controlId={name} className={'mb-2'}>
    <Form.Label>{label}</Form.Label>
    <Select
      placeholder={placeholder}
      onChange={onChange}
      className="basic-single"
      classNamePrefix="select"
      isSearchable={true}
      value={value}
      name={name}
      options={options}
      onBlur={onBlur}
    />
    {!hideErrorMessage && <ErrorMessage name={name} className={'errorText'} component="div"/>}
    {helpText && <div className={'helpText'}>{helpText}</div>}
  </Form.Group>

}

export default SelectorInput;