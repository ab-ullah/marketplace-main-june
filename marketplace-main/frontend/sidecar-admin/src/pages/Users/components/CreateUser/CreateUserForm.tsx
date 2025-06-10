import React, {FunctionComponent} from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import {ErrorMessage, Formik} from "formik";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "./constants";
import {StyledForm} from "../../../../presentational/forms";
import Form from 'react-bootstrap/Form';
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {createUser} from "../../thunks";
import {StyledButton} from "../../../../presentational/buttons";
import {selectUsers} from "../../selectors";


interface CreateUserFormProps {
  closeModal: () => void;
}


const CreateUserForm: FunctionComponent<CreateUserFormProps> = ({closeModal}) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    const userExists = users.find(user => user.email.toLowerCase().trim() === values.email);
    if (!userExists) {
      const payload = {
        email: values.email,
      }
      await dispatch(createUser(payload));
      // await dispatch(fetchUsers());
    }
    setSubmitting(false);
    closeModal();
  }

  return <Container fluid>
    <Col md={{span: 8}}>
      <Formik
        isSubmitting
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
          }) => (
          <StyledForm onSubmit={handleSubmit}>
            <Form.Group controlId="formFilterValue">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
              />
              <ErrorMessage name="email" component="div"/>
            </Form.Group>
            <Form.Group controlId="formFilterValue">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder="First Name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.firstName}
              />
              <ErrorMessage name="firstName" component="div"/>
            </Form.Group>
            <Form.Group controlId="formFilterValue">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder="First Name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.firstName}
              />
              <ErrorMessage name="lastName" component="div"/>
            </Form.Group>
            <StyledButton variant="outline-primary" type="submit" disabled={isSubmitting}>
              Create
            </StyledButton>
          </StyledForm>
        )}
      </Formik>
    </Col>
  </Container>;
};

export default CreateUserForm;
