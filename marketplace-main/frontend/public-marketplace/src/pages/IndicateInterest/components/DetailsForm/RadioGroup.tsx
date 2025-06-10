import React, {FunctionComponent} from "react";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";
import {OptionTypeBase} from "react-select";
import classNames from "classnames";


interface FormTextFieldProps {
  label: string | React.ReactNode;
  name: string;
  onChange: any;
  value: string | undefined | null;
  options: OptionTypeBase[];
  disabled?: boolean;
  hideErrorMessage?: boolean;
}


const RadioGroup: FunctionComponent<FormTextFieldProps> = (
  {
    label,
    name,
    onChange,
    value,
    options,
    disabled,
    hideErrorMessage
  }
) => {

  return <Form.Group className={'mb-2'}>
    <Form.Label>{label}</Form.Label>
    <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
      {options.map((option) => <Form.Check
          type={'radio'}
          name={'vehicle'}
          disabled={disabled}
          checked={option.value === value}
          onChange={() => onChange(option.value)}
          label={option.label}
          inline
          id={`${label}-${option.value}`}
          className={classNames({ 'selectedRadio': option.value === value })}
        />
      )}
    </div>
    {!hideErrorMessage && <ErrorMessage name={name} component="div" className={'errorText'}/>}
  </Form.Group>
}

RadioGroup.defaultProps = {
  disabled: false
}

export default RadioGroup;