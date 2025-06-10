import React, { FunctionComponent, useState } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { ErrorMessage, useField } from "formik";
import Row from "react-bootstrap/Row";
import Select, { OptionTypeBase } from "react-select";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { isEmpty } from "lodash";

interface FormSelectorFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur?: any;
  isDisabled?: boolean;
  value: OptionTypeBase | readonly OptionTypeBase[] | null | undefined;
  options: OptionTypeBase[];
  error?: any;
  isMulti?: boolean;
  allowCustom?: boolean;
  helperText?: string;
  optional?: boolean;
  selectedOptionPrefix?: string
}

const FormSelectorField: FunctionComponent<FormSelectorFieldProps> = ({
  label,
  name,
  placeholder,
  onChange,
  value,
  options,
  onBlur,
}) => {
  return (
    <Row className={"mt-2"}>
      <Col md={4} className="field-label">
        {label}
      </Col>
      <Col md={8}>
        <Form.Group controlId="rows">
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
            isDisable={true}
          />
          {/*<ErrorMessage name={name} component="div"/>*/}
        </Form.Group>
      </Col>
    </Row>
  );
};

const LabelCol = styled(Col)`
  line-height: 21px;
  font-size: 15px !important;
  font-weight: 700 !important;
  padding-bottom: 6px;
  display: flex;
`;

const StyledSelect = styled(Select)`
  .select__control {
    background-color: white;
    border: 1px solid #d5cbcb;
    min-height: 48px;
    height: auto;
    padding: 0px 16px 0px;
    .select__value-container {
      .select__placeholder {
        color: #020203;
        font-weight: 500;
      }
    }
    .select__indicator-separator {
      display: none;
    }
    &.select__control--is-disabled {
      background-color: #e9ecef;
      .select__single-value {
        color: #020203;
      }
    }
  }
  .select__menu {
    z-index: 4;
  }
`;

const HelperTextCont = styled.p`
	font-weight: 400;
	font-size: 12px;
	line-height: 20px;
	color: #556987;
	margin: 0px;
`

const OptionalTag = styled.p`
  color: #78909c;
  line-height: 21px;
  font-size: 15px !important;
  font-weight: 700 !important;
  margin: 0px;
  margin-left:5px;
`;

export const FormSelectorFieldRow: FunctionComponent<
  FormSelectorFieldProps
> = ({
  label,
  name,
  placeholder,
  onChange,
  value,
  options,
  onBlur,
  isDisabled,
  error,
  isMulti,
  allowCustom,
  helperText,
  optional,
  selectedOptionPrefix
}) => {
  let field;
  try {
    const fieldInfo = useField(name);
    field = fieldInfo[0];
  } catch (e) {
    field = false;
  }

  const [customOpt, setCustomOpt] = useState<Record<string, any>>({});

  const handleInputChange = (e: any) => {
    if (allowCustom) {
    const _value = isMulti? value : value? [value] :[]
      const optExists = !![...options, ...(_value as OptionTypeBase[])].find(
        (opt) => opt.label.toLowerCase() === e.toLowerCase()
      );
      if (!optExists && e) {
        setCustomOpt({ label: e, value: "custom" });
      } else {
        setCustomOpt({});
      }
    }
  };

  const handleChange = (e: any) => {
    if(!isEmpty(customOpt) && allowCustom){
    if (isMulti) {
      const valArr = e.map((val: OptionTypeBase) => {
        if (val.value !== "custom") {
          return val;
        } else {
          return { ...val, value: getNewId() };
        }
      });
      onChange(valArr);
    } 
    else{
      onChange({...customOpt, value: getNewId()})
    }
  }
    else {
      onChange(e);
    }
    setCustomOpt({});
  };
  const getNewId = () => {
    return uuidv4().split("-").join("");
  };

  return (
    <Row className={"mt-2"}>
     {label && <LabelCol md={12} className="field-label">
        {label} {optional && <OptionalTag>{` (optional)`}</OptionalTag>}
      </LabelCol>
}
      {helperText && <HelperTextCont>{helperText}</HelperTextCont>}
      <Col md={12}>
        <Form.Group controlId="rows">
          <StyledSelect
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            placeholder={placeholder}
            onChange={handleChange}
            onKeyDown={(e:any)=>e.stopPropagation()}
            onInputChange={(e: any) => handleInputChange(e)}
            value={value}
            name={name}
            options={
              (allowCustom && Object.values(customOpt).length > 0)
                ? [customOpt, ...options]
                : options
            }
            onBlur={onBlur}
            isDisabled={isDisabled}
            // menuPosition="fixed"
            isMulti={isMulti}
            formatOptionLabel={(option: { label: any; }, { context }: any) => {
              // Custom rendering for the selected option
              if (context === 'value' && selectedOptionPrefix) {
                return `${selectedOptionPrefix} ${option.label}`;
              }
              // Default rendering for the dropdown list
              return option.label;
            }}
          />
          {field && (
            <ErrorMessage className="text-danger" name={name} component="div" />
          )}
          {error && <p className="text-danger">{error}</p>}
        </Form.Group>
      </Col>
    </Row>
  );
};

export default FormSelectorField;
