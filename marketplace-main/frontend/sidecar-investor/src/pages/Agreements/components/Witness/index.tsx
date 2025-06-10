import React, {FunctionComponent} from 'react';

import "react-datepicker/dist/react-datepicker.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import {Formik} from "formik";
import {StyledForm} from "../../../../presentational/forms";
import Button from "react-bootstrap/Button";
import FormTextField from "../../../../components/Form/TextField";
import {getValidationSchema, INITIAL_VALUES} from "./constants";
import {useParams} from "react-router-dom";
import {useCreateWitnessMutation} from "../../../../api/rtkQuery/agreementsApi";
import {useAppSelector} from "../../../../app/hooks";
import {selectUserInfo} from "../../../User/selectors";


interface WitnessFormProps {
  setIsSubmitting: (arg0:boolean) => void
}


const WitnessForm: FunctionComponent<WitnessFormProps> = ({setIsSubmitting}) => {
  const {externalId} = useParams<{ externalId: string }>();
  const [createWitness] = useCreateWitnessMutation();
  const userInfo = useAppSelector(selectUserInfo);

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    setIsSubmitting(true)
    await createWitness({externalId, ...values})
    setSubmitting(false)
    //TODO: Fix the RTK issue here
    window.location.reload(true);
  }

  if (!userInfo) return <></>

  const validationSchema = getValidationSchema(userInfo.email)
  return <Container fluid className={'pb-5'}>
    <Col md={{span: 10}}>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => {
          return <StyledForm onSubmit={handleSubmit}>
            <FormTextField
              label="Email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={() => {
              }}
              value={values.email}
            />
            <FormTextField
              label="Name"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={() => {
              }}
              value={values.name}
            />
            <Button variant="outline-primary" type="submit" className={'submit-button'} disabled={isSubmitting}>
              Save
            </Button>
          </StyledForm>
        }}
      </Formik>
    </Col>
  </Container>;
};

export default WitnessForm;
