import React, {FunctionComponent, useState} from 'react';
import Row from "react-bootstrap/Row";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "./constants";
import {StyledForm} from "../../../presentational/forms";
import Form from "react-bootstrap/Form";
import {ErrorMessage, Formik} from "formik";
import {DropzoneArea} from 'material-ui-dropzone'
import API from "../../../api";
import Button from "react-bootstrap/Button";
import {DropZoneContainer, StyledFormLabel, SubmitButtonDiv} from "./styles";
import LinearProgressWithLabel from "../../../components/Loading";


interface UploadDocumentsFormProps {
  externalId: string
}


const UploadDocumentsForm: FunctionComponent<UploadDocumentsFormProps> = ({externalId}) => {
  const [uploaded, setUploaded] = useState<number>(0)

  const onSubmit = async (values: any, {setSubmitting}: any) => {
    setSubmitting(true);
    let count = 0;
    for (const file of values.files) {
      const formData = new FormData();
      formData.append('document_file', file);
      formData.append('title', values.title);
      formData.append('fund_external_id', externalId);
      await API.uploadDocuments(formData)
      count += 1
      setUploaded(count)
    }
    setSubmitting(false);
  }

  return <>
    <Row>
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
            setFieldValue,
            isSubmitting,
          }) => (
          <StyledForm onSubmit={handleSubmit}>
            <Form.Group controlId="formFilterValue">
              <StyledFormLabel>Title</StyledFormLabel>
              <Form.Control
                type="text"
                name="title"
                placeholder="Title"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.title}
              />
              <ErrorMessage name="personalInvestment" component="div"/>
            </Form.Group>
            <Form.Group controlId="formFilterValue">
              <StyledFormLabel>Attach Documents</StyledFormLabel>
              <DropZoneContainer>
                <DropzoneArea
                  onChange={(value: any) => setFieldValue('files', value)}
                  dropzoneText={'Drag and Drop Here'}
                  acceptedFiles={['application/msword', 'application/pdf']}
                />
              </DropZoneContainer>
              <ErrorMessage name="files" component="div"/>
            </Form.Group>
            {isSubmitting && <div>
              <div>Uploading In Progress</div>
              <div>
                <LinearProgressWithLabel value={values.files.length ? (uploaded * 100) / values.files.length : 0}/>
              </div>
            </div>}
            <SubmitButtonDiv>
              <Button variant="outline-primary" type="submit" disabled={isSubmitting} className={'mt-4'}>
                Upload
              </Button>
            </SubmitButtonDiv>
          </StyledForm>
        )}
      </Formik>
    </Row>
  </>
};

export default UploadDocumentsForm;
