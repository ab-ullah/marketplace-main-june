import React, {FunctionComponent} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";
import Row from "react-bootstrap/Row";
import DatePicker from "react-datepicker";

interface FormDateFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur: any;
  value: Date | null | undefined;
}


const FormDateField: FunctionComponent<FormDateFieldProps> = (
  {
    label,
    name,
    placeholder,
    onChange,
    value,
    onBlur,
  }
) => {
  return <Row className={'mt-2'}>
    <Col md={4} className='field-label'>
      {label}
    </Col>
    <Col md={8}>
      <Form.Group controlId="formFilterValue">
        <DatePicker
          selected={value}
          onChange={onChange}
          minDate={new Date()}
          name={name}
          placeholderText={placeholder}
          onBlur={onBlur}
        />
        <ErrorMessage name={name} component="div"/>
      </Form.Group>
    </Col>
  </Row>
}

export default FormDateField;