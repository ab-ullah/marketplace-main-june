import React, { FunctionComponent } from "react";
import map from "lodash/map";
import includes from "lodash/includes";
import Form from "react-bootstrap/Form";
import { ErrorMessage, useField } from "formik";
import { OptionTypeBase } from "react-select";
import { CheckboxBlock as StyledCheckbox } from "./styles";
import { filter } from "lodash";

interface IFormCheckboxBlock {
  label: string | React.ReactNode;
  name: string;
  onChange: (selectedValues: string[]) => void;
  selectedValues: string[] | undefined | null;
  options: OptionTypeBase[];
}

const CheckboxBlock: FunctionComponent<IFormCheckboxBlock> = ({
  label,
  name,
  onChange,
  selectedValues,
  options,
}) => {
  let field;
  try {
    const fieldInfo = useField(name);
    field = fieldInfo[0];
  } catch (e) {
    field = null;
  }

  const handleChange = (e: any) => {
    const { value } = e.target;
    if (includes(selectedValues, value)) {
      return onChange(filter(selectedValues, (val) => val !== value));
    }
    if (selectedValues) return onChange([...selectedValues, value]);

    return onChange([value]);
  };

  return (
    <Form.Group controlId={`formBasicCheckbox${name}`}>
      {map(options, (option, index) => (
        <StyledCheckbox
          key={index}
          type="checkbox"
          checked={includes(selectedValues, option.value)}
          label={option.label}
          value={option.value}
          onChange={handleChange}
        />
      ))}
      {field && <ErrorMessage name={name} component="div" className="errorText" />}
    </Form.Group>
  );
};

export default CheckboxBlock;
