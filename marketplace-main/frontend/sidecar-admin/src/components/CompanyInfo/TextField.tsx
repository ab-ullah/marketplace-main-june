import React, {FunctionComponent} from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import {ErrorMessage, useField} from "formik";
import Row from "react-bootstrap/Row";

interface FormTextFieldProps {
  label: string;
  name: string;
  placeholder: string;
  onChange: any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string | number | string[] | undefined;
  disabled?: boolean;
  error?: any;
}


export const TextField: FunctionComponent<FormTextFieldProps> = ({
                                                                          label,
                                                                          name,
                                                                          placeholder,
                                                                          onChange,
                                                                          onBlur,
                                                                          value,
                                                                          error,
                                                                          disabled,
                                                                        }) => {

  let field;
  try {
    const fieldInfo = useField(name);
    field = fieldInfo[0];
  } catch (e) {
    field = false;
  }
  return (
    <Row>
      <Col className={'text-label'}>
        {label}
      </Col>
      <Col md="12" >
        <Form.Group controlId="formFilterValue">
          <Form.Control
            className={'text-input'}
            type="text"
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            disabled={!!disabled}
          />
          {field && <ErrorMessage className="text-danger" name={name} component="div" /> }
          {error && <p className="text-danger">{error}</p>}
        </Form.Group>
      </Col>
    </Row>
  );
};

export default TextField;
