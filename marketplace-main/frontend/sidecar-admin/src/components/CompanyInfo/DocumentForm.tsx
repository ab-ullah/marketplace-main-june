import {FC, useMemo} from "react";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import map from "lodash/map";
import isNil from "lodash/isNil";
import {ErrorMessage, Formik} from "formik";
import * as Yup from "yup";
import Select from "react-select";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import API from "../../api/backendApi";
import {useGetCompanyInfoQuery} from "../../api/rtkQuery/companyApi";
import {useGetAdminUsersQuery} from "../../api/rtkQuery/commonApi";
import {GP_SIGNER_GROUP} from "../../pages/Funds/components/CreateFund/constants";
import DocumentDropZone from "../FileUpload";
import CheckboxBlock from "../Form/CheckboxBlock";
import DocTag from "../FilePreviewModal/DocTag";
import get from "lodash/get";
import FilePreviewModal from "../FilePreviewModal";
import {CheckboxWrapper, DocumentUploadWrapper} from "./styles";
import TextField from "./TextField";
import { logMixPanelEvent } from "../../utils/mixPanel";

const ButtonsContainer = styled.div`
  text-align: right;
`;


const INITIAL_VALUES = {
  "document_file": "",
  "name": "",
  "description": "",
  "required_once": false,
  "require_signature": false,
  "require_wet_signature": false,
  "require_gp_signature": false,
}


export const VALIDATION_SCHEMA = Yup.object({
  "name": Yup.string().required("Required"),
  "description": Yup.string().required("Required"),
  "required_once": Yup.boolean(),
  "require_signature": Yup.boolean(),
  "require_gp_signature": Yup.boolean(),
  "gp_signer": Yup.object().when(["require_gp_signature"], {
    is: (value: any) => value,
    then: Yup.object().shape({
      label: Yup.string().required("Required"),
      value: Yup.string().required("Required"),
    })
  }).nullable(),
  "require_wet_signature": Yup.boolean(),
});


const DocumentForm: FC<any> = ({data, closeModal}) => {
  const {refetch} = useGetCompanyInfoQuery({});
  const {data: adminUsers} = useGetAdminUsersQuery({});

  const handleChange = async (values: any) => {
    const formData = new FormData();
    if (values.document_file)
      formData.append("document_file", values.document_file);

    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("required_once", values.required_once);
    formData.append("require_signature", values.require_signature);
    formData.append("require_wet_signature", values.require_wet_signature);
    formData.append("require_gp_signature", values.require_gp_signature);
    const gpSigner = get(values.gp_signer, "value");
    if (!isNil(gpSigner) && values.require_gp_signature)
      formData.append("gp_signer", gpSigner);
    if (values.id){
      await API.updateCompanyDocument(values.id, formData);
      logMixPanelEvent('Company Document Updated');
    }
    else{
      await API.saveCompanyDocument(formData);
      logMixPanelEvent('Added Company Document')
    }
    refetch();
    closeModal();
    return true;
  }
  const GPSignerUsers = useMemo(() => {
    const GPSigners = filter(adminUsers, (user) => {
        return filter(user.groups, (group) => group.name === GP_SIGNER_GROUP).length > 0
      }
    )
    return map(GPSigners, (user) => {
        return {
          value: user.id,
          label: `${user.user.first_name} ${user.user.last_name}`,
        }
      }
    )
  }, [adminUsers]);

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
    if (initialData.gp_signer) {
      initialData.gp_signer = GPSignerUsers.find(signer => signer.value == data.gp_signer)
    }
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
          console.log(values,' vals')
        return (
          <>
            <TextField
              label="Name"
              placeholder="Name"
              name="name"
              onChange={(e: any) => setFieldValue("name", e.target.value)}
              value={values.name}
            />
            <TextField
              label="Description"
              placeholder="Description"
              name="description"
              onBlur={() => {
              }}
              onChange={(e: any) => setFieldValue("description", e.target.value)}
              value={values.description}
            />
            <Row className={"mt-2 mb-3"}>
              <Col md={12} className="field-label">
                Upload Document
              </Col>
              <Col md={12}>
                <DocumentUploadWrapper>
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
                </DocumentUploadWrapper>
              </Col>
            </Row>
            {data && data.document && <FilePreviewModal
              documentId={data.document.document_id}
              documentName={data.document.title}
            />}
            <CheckboxWrapper>
              <CheckboxBlock
                label="required_once"
                name="required_once"
                onChange={() => setFieldValue("required_once", !values.required_once)}
                selectedValues={values.required_once ? ["Required Once"] : []}
                options={[{label: "Required Once", value: "Required Once"}]}
              />
              {(values.document_file || values?.document?.id) && (
                <>
                  <Row>
                    <Col md={3} sm={12}>
                      <CheckboxBlock
                        label="require_signature"
                        name="require_signature"
                        onChange={() => setFieldValue("require_signature", !values.require_signature)}
                        selectedValues={values.require_signature ? ["Required Sign"] : []}
                        options={[{label: "Required Sign", value: "Required Sign"}]}
                      />
                    </Col>
                    {values.require_signature && !values.require_wet_signature && (
                      <>
                        <Col md={4} sm={12}>
                          <CheckboxBlock
                            label="require_gp_signature"
                            name="require_gp_signature"
                            onChange={() => setFieldValue("require_gp_signature", !values.require_gp_signature)}
                            selectedValues={values.require_gp_signature ? ["Required GP Signature"] : []}
                            options={[{label: "Required GP Signature", value: "Required GP Signature"}]}
                          />
                        </Col>
                        <Col md={5} sm={12}>
                          {values.require_gp_signature && (
                            <div className={'gp-selector'}>
                              <Select
                                placeholder="GP Signer"
                                onChange={(value: any) => {
                                  setFieldValue("gp_signer", value);
                                }}
                                className="basic-single"
                                classNamePrefix="select"
                                isSearchable={true}
                                isMulti={false}
                                value={values.gp_signer}
                                name="gp_signer"
                                options={GPSignerUsers || null}
                                onBlur={() => {
                                }}
                              />
                              <ErrorMessage className="text-danger" name="gp_signer" component="div"/>
                            </div>
                          )}
                        </Col>
                      </>
                    )}
                  </Row>
                  {values.require_signature && (
                    <CheckboxBlock
                      label="require_wet_signature"
                      name="require_wet_signature"
                      onChange={() => setFieldValue("require_wet_signature", !values.require_wet_signature)}
                      selectedValues={values.require_wet_signature ? ["Required Wet Signature"] : []}
                      options={[{label: "Required Wet Signature", value: "Required Wet Signature"}]}
                    />
                  )}

                </>
              )}
            </CheckboxWrapper>
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
