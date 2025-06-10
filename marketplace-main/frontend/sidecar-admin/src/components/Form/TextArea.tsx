import React, { FunctionComponent } from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { ErrorMessage, useField } from "formik";
import Row from "react-bootstrap/Row";
import styled from "styled-components";

interface FormTextAreaProps {
  label: string;
  name: string;
  className?: string;
  placeholder: string;
  onChange: (event: any) => void;
  onBlur: (event: any) => void;
  value: string | number | string[] | undefined;
  disabled?: boolean;
  error?: any;
}

const LabelCol = styled(Col)`
  font-size: 15px !important;
  font-weight: 700 !important;
  line-height: 21px;
  padding-bottom: 6px;
`;

export const FormTextAreaRow: FunctionComponent<FormTextAreaProps> = ({
  label,
  name,
  placeholder,
  onChange,
  onBlur,
  value,
  error,
  disabled,
  className
}) => {
  let field;
  try {
    const fieldInfo = useField(name);
    field = fieldInfo[0];
  } catch (e) {
    field = false;
  }
  return (
    <Row className={`mt-2 ${className || ""}`}>
      <LabelCol md={12} className="field-label">
        {label}
      </LabelCol>
      <Col  md={12}>
        <Form.Group controlId="formFilterValue">
          <Form.Control
            as="textarea"
            rows={3}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            disabled={!!disabled}
          />
           {field && <ErrorMessage className="text-danger" name={name} component="div" />}
           {error && <p className="text-danger">{error}</p>}
        </Form.Group>
      </Col>
    </Row>
  );
};

export default FormTextAreaRow;
