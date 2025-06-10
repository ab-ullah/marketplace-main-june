import React, {FunctionComponent} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {ErrorMessage} from "formik";
import Row from "react-bootstrap/Row";
import ReactDatePickerComp from "../ReactDatePickerComp";

interface FormDateFieldProps {
  label: string;
  name?: string;
  placeholder?: string;
  onChange: any;
  onBlur?: any;
  value: Date | null | undefined;
  minDate?: Date | null; 
}

const FormDateField: FunctionComponent<FormDateFieldProps> = (
  {
    label,
    name,
    placeholder,
    onChange,
    value,
    minDate,
    onBlur,
  }
) => {
  return <Row className={'mt-2'}>
    <Col md={12} className='field-label'>
      {label}
    </Col>
    <Col md={12}>
      <Form.Group controlId="formFilterValue">
        {/* <DatePicker
          selected={value}
          onChange={onChange}
          name={name}
          placeholderText={placeholder}
          onBlur={onBlur}
          minDate={minDate}
        /> */}
        <ReactDatePickerComp
          selected={value}
          onChange={onChange}
          name={name}
          placeholderText={placeholder}
          onBlur={onBlur}
          minDate={minDate}
        />
        {name &&
       <ErrorMessage name={name}>
          {(msg) => <div style={{ color: 'red' }}>{msg}</div>}
        </ErrorMessage>}
      </Form.Group>
    </Col>
  </Row>
}

export default FormDateField;