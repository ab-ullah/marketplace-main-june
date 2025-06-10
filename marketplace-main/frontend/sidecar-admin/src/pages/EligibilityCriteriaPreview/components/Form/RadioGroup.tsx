import React, {FunctionComponent} from "react";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";
import {OptionTypeBase} from "react-select";


interface FormTextFieldProps {
  label: string | React.ReactNode;
  name: string;
  onChange: any;
  value: string | undefined | null;
  options: OptionTypeBase[];
}


const RadioGroup: FunctionComponent<FormTextFieldProps> = (
  {
    label,
    name,
    onChange,
    value,
    options
  }
) => {
  return <Form.Group className={'mb-4'}>
    <Form.Label>{label}</Form.Label>
    <div key={`inline-radio`} className="mb-1 custom-radio-buttons">
      {options.map((option) => <Form.Check
          type={'radio'}
          name={'vehicle'}
          checked={option.value === value}
          onChange={() => onChange(option.value)}
          label={option.label}
          inline
          id={`${label}-${option.value}`}
        />
      )}
    </div>
    <ErrorMessage name={name} component="div" className={'errorText'}/>
  </Form.Group>
}

export default RadioGroup;