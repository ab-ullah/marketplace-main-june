import React, { FunctionComponent } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { ErrorMessage, useField } from "formik";
import Row from "react-bootstrap/Row";
import styled from "styled-components";

interface FormTextFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string | number | string[] | undefined;
  disabled?: boolean;
  error?: any;
  helperText?: string;
  readOnly?:boolean;
  optional?: boolean;
}

const FormTextField: FunctionComponent<FormTextFieldProps> = ({
  label,
  name,
  placeholder,
  onChange,
  onBlur,
  value,
  disabled,
}) => {
  return (
    <Row className={"mt-2"}>
      <Col md={4} className="field-label">
        {label}
      </Col>
      <Col md={8}>
        <Form.Group controlId="formFilterValue">
          <Form.Control
            type="text"
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            disabled={!!disabled}
          />
          <ErrorMessage name={name} component="div" />
        </Form.Group>
      </Col>
    </Row>
  );
};

const LabelCol = styled(Col)`
  font-size: 15px !important;
  font-weight: 700 !important;
  line-height: 21px;
  padding-bottom: 6px;
`;

const TextInputContainer = styled(Form.Control)`
  background-color: white;
  border: 1px solid #d5cbcb !important;
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

export const FormTextFieldRow: FunctionComponent<FormTextFieldProps> = ({
  label,
  name,
  placeholder,
  onChange,
  onBlur,
  value,
  error,
  disabled,
  helperText,
  readOnly,
  optional
}) => {
  
  let field;
  try {
    const fieldInfo = useField(name);
    field = fieldInfo[0];
  } catch (e) {
    field = null;
  }

  return (
    <Row className={"mt-2"}>
     {label && <LabelCol md="12" className="field-label">
        {label} {optional && <OptionalTag>{` (optional)`}</OptionalTag>}
      </LabelCol>
}
      <Col md="12" >
        <Form.Group controlId="formFilterValue">
        {helperText && <HelperTextCont>{helperText}</HelperTextCont>}
          <TextInputContainer
            type="text"
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            disabled={!!disabled}
            readOnly={readOnly}
            {...field}
          />
          {field && !error && <ErrorMessage className="text-danger" name={name} component="div" /> }
          {error && <p className="text-danger">{error}</p>}
        </Form.Group>
      </Col>
    </Row>
  );
};

export default FormTextField;
