import React, {FunctionComponent} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";
import Row from "react-bootstrap/Row";
import styled from "styled-components";

interface FormNumberFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur: any;
  value: string | number | string[] | undefined;
}

const LabelRow = styled(Row)`
  font-size: 15px !important;
  font-weight: 700 !important;
  line-height: 21px;
  padding-left: 12px;
  padding-bottom: 6px;
`;

const InputContainer = styled(Form.Control)`
  background-color: white !important;
  border: 1px solid #D5CBCB !important;
`;

const FormNumberField: FunctionComponent<FormNumberFieldProps> = (
  {
    label,
    name,
    placeholder,
    onChange,
    onBlur,
    value
  }
) => {
  return <Row className={'mt-2'}>
    <Col md={12} className='field-label'>
      <LabelRow md={4} className='field-label'>
        {label}
      </LabelRow>
    </Col>
    <Col md={12}>
      <Form.Group controlId="formFilterValue">
        <InputContainer
          type="number"
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
        />
        <ErrorMessage className="text-danger" name={name} component="div"/>
      </Form.Group>
    </Col>
  </Row>
}

export default FormNumberField;