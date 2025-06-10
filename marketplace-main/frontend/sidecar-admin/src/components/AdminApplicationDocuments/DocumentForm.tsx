import {FC} from "react";
import isEmpty from "lodash/isEmpty";
import {Formik} from "formik";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import API from "../../api/backendApi";
import {useGetCompanyInfoQuery} from "../../api/rtkQuery/companyApi";
import {FormTextFieldRow} from "../Form/TextField";
import {FormTextAreaRow} from "../Form/TextArea";
import DocumentDropZone from "../FileUpload";
import DocTag from "../FilePreviewModal/DocTag";
import FilePreviewModal from "../FilePreviewModal";
import {INITIAL_VALUES, VALIDATION_SCHEMA} from "./config";
import {ButtonsContainer} from "./styles";
import {useGetApplicationDocumentsQuery} from "../../api/rtkQuery/fundsApi";


const DocumentForm: FC<any> = ({data, closeModal, applicationId}) => {
  const {refetch} = useGetApplicationDocumentsQuery(applicationId);

  const handleChange = async (values: any) => {
    const formData = new FormData();
    if (values.document_file)
      formData.append("document_file", values.document_file);
    formData.append("document_name", values.document_name);
    formData.append("document_description", values.document_description);
    if (values.id)
      await API.updateAdminApplicationDocument(applicationId, values.id, formData);
    else
      await API.saveAdminApplicationDocument(applicationId, formData);
    refetch();
    closeModal();
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

  let initialData;
  if (isEmpty(data)) initialData = INITIAL_VALUES
  else {
    initialData = {...data}
  }

  return (

    <Formik
      initialValues={initialData}
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
          <>
            <FormTextFieldRow
              label="Name"
              placeholder="Name"
              name="document_name"
              onChange={(e: any) => setFieldValue("document_name", e.target.value)}
              value={values.document_name}
            />
            <FormTextAreaRow
              className="mb-3"
              label="Description"
              placeholder="Description"
              name="document_description"
              onBlur={() => {
              }}
              onChange={(e: any) => setFieldValue("document_description", e.target.value)}
              value={values.document_description}
            />
            {!data?.document && <Row className={"mt-2 mb-3"}>
              <Col md={12} className="field-label">
                Upload Document
              </Col>
              <Col md={12}>
                <Form.Group controlId="formFilterValue">
                  {values.document_file ? (
                    <DocTag documentName={values.document_file?.name}
                            handleDelete={() => setFieldValue("document_file", "")}/>
                  ) : (
                    <DocumentDropZone onFileSelect={(file) => {
                      setFieldValue("document_file", file)
                    }} disabled={false}/>
                  )}
                </Form.Group>
              </Col>
            </Row>}
            {data && data.document && <FilePreviewModal
              documentId={data.document.document_id}
              documentName={data.document.title}
            />}

            <ButtonsContainer className="text-right">
              <Button
                variant="outline-primary"
                type="cancel"
                className={"cancel-button"}
                disabled={isSubmitting}
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                className={"submit-button"}
                disabled={isSubmitting}
                onClick={() => handleSubmit()}
              >
                Save
              </Button>
            </ButtonsContainer>
          </>
        )
      }}
    </Formik>
  )
};

export default DocumentForm;
