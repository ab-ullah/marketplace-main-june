import { FunctionComponent, useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { Formik } from "formik";
import { StyledForm } from "../../../../presentational/forms";
import { FormTextFieldRow } from "../../../../components/Form/TextField";
import { FormTextAreaRow } from "../../../../components/Form/TextArea";
import { DocumentRequestFooter } from "./styles";
import Button from "react-bootstrap/Button";

interface RequestDocumentProps {
  handleClose: () => void;
  onSubmit: (values: any) => void;
}

const RequestDocument: FunctionComponent<RequestDocumentProps> = ({
  handleClose,
  onSubmit
}) => {
  return (
    <Container fluid className={"pb-5"}>
      <Formik
        initialValues={{
          document_name: "",
          document_description: "",
        }}
        onSubmit={onSubmit}
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
            <>
              <StyledForm>
                <FormTextFieldRow
                  label="Document Name"
                  name="document_name"
                  placeholder="Document Name"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.document_name}
                />
                <FormTextAreaRow
                  label="Description"
                  name="document_description"
                  placeholder="Description"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.document_description}
                />
                <DocumentRequestFooter>
                  <Button variant="outline-primary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button type="button" onClick={() => handleSubmit()}>
                    Save
                  </Button>
                </DocumentRequestFooter>
              </StyledForm>
            </>
          );
        }}
      </Formik>
    </Container>
  );
};

export default RequestDocument;
