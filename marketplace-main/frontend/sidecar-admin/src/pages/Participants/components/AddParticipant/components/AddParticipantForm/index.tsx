import { Formik } from "formik";
import Container from "react-bootstrap/Container";
import { StyledForm } from "../../../../../../presentational/forms";
import Button from "react-bootstrap/Button";
import {
  INITIAL_VALUES,
  VALIDATION_SCHEMA,
} from "./constants";
import { FormTextFieldRow } from "../../../../../../components/Form/TextField";
import styled from "styled-components";
import { Alert } from "react-bootstrap";
import { useState } from "react";
import API from "../../../../../../api/backendApi";

const ButtonsContainer = styled.div`
  text-align: right;
`;

const FieldsRow = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 24px;
`;

const AddParticipantForm = ({ closeModal, handleRefetch }: any) => {
  const [alert, setAlert] = useState<any>(null);

  const handleRes = (status: string, res: any) => {
    setAlert({
      type: status,
      msg:
        status === "success"
          ? "Your invite has been sent"
          : res[Object.keys(res)[0]][0],
    });
    if (status === "success") {
      handleRefetch();
    }
    setTimeout(() => {
      setAlert(null);
      closeModal();
    }, 1000);
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting, setFieldError, setFieldValue, setValues }: any
  ) => {

    const res = await API.createParticipantInvite(values);
    if (res.success) {
      handleRes("success", res.data);
    } else {
      handleRes("danger", res.data);
    }
  };

  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };

  return (
    <Container fluid>
      <Formik
        initialValues={INITIAL_VALUES}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          errors,
        }) => {
          return (
            <StyledForm onSubmit={handleSubmit}>
              <FieldsRow>
                <div className="w-50">
                  <FormTextFieldRow
                    label="First Name"
                    name="first_name"
                    placeholder="John"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.first_name}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="w-50">
                  <FormTextFieldRow
                    label="Last Name"
                    name="last_name"
                    placeholder="Doe"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.last_name}
                    disabled={isSubmitting}
                  />
                </div>
              </FieldsRow>

              <div className="mb-5">
                <FormTextFieldRow
                  label="Email"
                  name="email"
                  placeholder="Add the participant email here"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  disabled={isSubmitting}
                />
              </div>

              <ButtonsContainer className="text-right">
                <Button
                  variant="outline-primary"
                  type="cancel"
                  className={"cancel-button"}
                  disabled={isSubmitting}
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline-primary"
                  type="submit"
                  className={"submit-button"}
                  disabled={isSubmitting}
                >
                  Invite
                </Button>
              </ButtonsContainer>
              {alert && <Alert variant={alert.type}>{alert.msg}</Alert>}
            </StyledForm>
          );
        }}
      </Formik>
    </Container>
  );
};

export default AddParticipantForm;
