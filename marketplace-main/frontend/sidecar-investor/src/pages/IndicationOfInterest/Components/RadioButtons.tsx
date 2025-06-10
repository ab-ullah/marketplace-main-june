import React, { FunctionComponent } from 'react';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { ErrorMessage } from 'formik';
import { InnerFieldContainer, RadioButton, RadioInput, RadioInner } from '../../KnowYourCustomer/styles';


const RadioField: FunctionComponent<any> = ({ label, name, options, value, onChange }) => {

  return <InnerFieldContainer>
    <Row className={'mb-1'}>
      <Row>
      <label>{label}</label>
      </Row>
      <Row>
      <Col md={8}>
        <Row>
          {options.map((option: any) => {
            const isChecked = option.value == value; // eslint-disable-line eqeqeq
            return <RadioButton
              key={option.value}
              checked={isChecked}
              onClick={() => onChange(option.value)}
            >
              <input
                type="radio"
                value={option.value}
                id={option.value.toString()}
                name={name}
                checked={isChecked}
                onChange={onChange}
                onClick={() => onChange(option.value)}
              ></input>
              <RadioInput checked={isChecked}>
                <RadioInner checked={isChecked} />
              </RadioInput>
              <label>{option.label}</label>
            </RadioButton>
          })}
        </Row>
      </Col>
      </Row>
      <ErrorMessage name={name} component="div" className={'errorText'}/>
    </Row>
  </InnerFieldContainer>
}

export default RadioField;