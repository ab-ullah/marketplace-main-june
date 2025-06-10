import React, {FunctionComponent} from 'react';

import "react-datepicker/dist/react-datepicker.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import {ErrorMessage, Formik} from "formik";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "./constants";
import {StyledForm} from "../../../../presentational/forms";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import moment from "moment";
import {IFormDetails} from "./interfaces";
import {IFundDetail} from "../../../../interfaces/fundDetails";
import CurrencyInput from "../../../../components/Form/CurrencyInput";


interface CreateFundFormProps {
  setCallDetails: (args0: IFormDetails) => void;
  fund: IFundDetail;
}


const CreateCapitalCallForm: FunctionComponent<CreateFundFormProps> = ({setCallDetails, fund}) => {
  const currencySymbol = fund.currency?.symbol;
  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    const payload = {
      dueDate: moment(values.dueDate).format('YYYY-MM-DD'),
      callAmount: values.callAmount,
    }
    setCallDetails(payload)
    setSubmitting(false);
  }

  return <Container fluid>
    <Col md={{span: 8}}>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={onSubmit}
      >
        {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue
          }) => (
          <StyledForm onSubmit={handleSubmit}>
            <Form.Group controlId="formFilterValue">
              <Form.Label>Call Amount</Form.Label>
              <CurrencyInput
                value={values.callAmount}
                name={'callAmount'}
                placeholder={'Call Amount'}
                onChange={(name: string, value: any) => setFieldValue(name, value)}
                symbol={currencySymbol}
              />
              <ErrorMessage name="callAmount" component="div"/>
            </Form.Group>
            <Form.Group controlId="formFilterValue">
              <Form.Label>Due Date</Form.Label>
              <DatePicker
                selected={values.dueDate}
                onChange={(date) => setFieldValue('dueDate', date)}
                minDate={new Date()}
                name="dueDate"
              />
              <ErrorMessage name="dueDate" component="div"/>
            </Form.Group>
            <Button variant="outline-primary" type="submit" disabled={isSubmitting}>
              Create Capital Call
            </Button>
          </StyledForm>
        )}
      </Formik>
    </Col>
  </Container>;
};

export default CreateCapitalCallForm;
