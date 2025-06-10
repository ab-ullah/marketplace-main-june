import {FC} from "react";
import {Formik} from "formik";
import Select from "react-select";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import get from "lodash/get";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "./constants";
import DocumentDropZone from "../../../../components/FileUpload";
import DocTag from "../../../../components/FilePreviewModal/DocTag";
import Container from "react-bootstrap/Container";
import {ISelectOption} from "../../../../interfaces/form";
import {StyledErrorMessage} from "./styles";


interface UploadDocumentProps {
  onCancel: () => void;
  onSave: (payload: any) => void;
  options: ISelectOption[],
}



const UploadDocument: FC<UploadDocumentProps> = ({onSave, onCancel, options}) => {

  const handleChange = async (values: any) => {
    const formData = new FormData();
    if (values.file_data)
      formData.append("file_data", values.file_data);

    formData.append("field_id", get(values.field_id, "value"));
    await onSave(formData)
    onCancel()
    return true;
  }

  const onSubmit = async (
    values: any,
    {setSubmitting}: any
  ) => {
    setSubmitting(true);
    await handleChange(values);
    setSubmitting(false);
  }

  return (

    <Formik
      initialValues={INITIAL_VALUES}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({
          errors,
          values,
          handleSubmit,
          isSubmitting,
          setFieldValue
        }) => {

        return (
          <Container>
            <Row>
              <Col md={12} className={'mb-2'}>
                Select Document Type
              </Col>
              <Col md={9} className={'mb-2 p-2'}>
                <Select
                  placeholder="Document Type"
                  onChange={(value: any) => {
                    setFieldValue("field_id", value);
                  }}
                  className="basic-single ms-lg-3"
                  classNamePrefix="select"
                  isSearchable={true}
                  isMulti={false}
                  value={values.field_id}
                  name="field_id"
                  options={options}
                  onBlur={() => {
                  }}
                />
                <StyledErrorMessage className="text-danger" name="field_id" component="div"/>
              </Col>
            </Row>
            <Row className={"mt-2 mb-3"}>
              <Col md={12} className="field-label">
                Upload Document
              </Col>
              <Col md={12}>
                <Form.Group controlId="formFilterValue">
                  {values.file_data ? (
                    <DocTag
                      // @ts-ignore
                      documentName={values.file_data?.name}
                      handleDelete={() => setFieldValue("file_data", null)}
                    />
                  ) : (
                    <DocumentDropZone onFileSelect={(file) => {
                      setFieldValue("file_data", file)
                    }} disabled={false}/>
                  )}
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col className={'mt-3 mb-2'}>
                <Button
                  variant="outline-primary"
                  type="cancel"
                  className={"cancel-button float-end"}
                  disabled={isSubmitting}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className={"submit-button"}
                  disabled={isSubmitting || !values.file_data}
                  onClick={() => handleSubmit()}
                >
                  Save
                </Button>
              </Col>
            </Row>
          </Container>
        )
      }}
    </Formik>
  )
}
  ;


export default UploadDocument;

