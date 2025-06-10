import { Formik } from "formik";
import { Col, Container, Form, Row } from "react-bootstrap";
import styled from "styled-components";
import { StyledForm } from "../../../../../../../../../../presentational/forms";
import RadioField from "../../../../../../../../../../components/Form/RadioField";
import get from "lodash/get";
import {
  DangerButton,
  OutlinedButton,
  SecondaryButton,
} from "../../../../../../../styles";
import { FormTextFieldRow } from "../../../../../../../../../../components/Form/TextField";
import { DocumentUploadWrapper } from "../../../../../../../../../../components/CompanyInfo/styles";
import DocTag from "../../../../../../../../../../components/FilePreviewModal/DocTag";
import DocumentDropZone from "../../../../../../../../../../components/FileUpload";
import { FormSelectorFieldRow } from "../../../../../../../../../../components/Form/SelectorField";
import SimpleCheckbox from "../../../../../../../../../../components/Form/SimpleCheckbox";
import { useEffect, useMemo, useState } from "react";
import { confirmationDescription, formatCarryPlansOptions, validationSchema } from "./constants";
import API from "../../../../../../../../../../api/backendApi";
import { useGetAdminUsersQuery } from "../../../../../../../../../../api/rtkQuery/commonApi";
import { filter, isEmpty, isNil, map } from "lodash";
import { GP_SIGNER_GROUP } from "../../../../../../../../../Funds/components/CreateFund/constants";
import CheckboxSelector from "../../../../../../../../../../components/Form/CheckboxSelector";
import ConfirmationModal from "../../../../../../../../../../components/ConfirmationModal";
import CustomRadioGroup from "../../../../../../../../../../components/Form/CustomRadioGroup";
// import { OptionTypeBase } from "react-select";

interface ICreateDocumentFormProps {
  closeModal: (_refresh?: boolean) => void;
  initState?: Record<string, any>;
  handleToggleActivateDoc: any;
}

const ButtonsContainer = styled.div`
  text-align: right;
  background: #f5f7f8;
  width: calc(100% + 56px);
  margin-left: -28px;
  margin-bottom: -16px;
  margin-top: 20px;
  padding: 15px 28px;
  border-top: 1px solid #d5dae1;
`;

const MaxWidth = styled.div<{max:string}>`

max-width:${props=>props.max};
`

const docTypeOptions = [
  {
    label: "Award Document",
    value: 1,
    description:
      "Award documents are triggered when a new carry allocation is created",
  },
  {
    label: "Forfeiture Document",
    value: 2,
    description:
      "Forfeiture documents are triggered when a carry forfeiture is created",
  },
];

const showSettingsOptions = [
  { label: "Every Time", value: "every_time", description: 'Participants will receive this document for each new carry allocation' },
  { label: "Once", value: "once", description: 'Participants will receive this document one time upon the first allocation' },
];

const CreateDocumentForm = ({
  closeModal,
  initState,
  handleToggleActivateDoc,
}: ICreateDocumentFormProps) => {
  const { data: adminUsers } = useGetAdminUsersQuery({});
  const [carryPlanOptions, setCarryPlanOptions] = useState<any[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const handleClose = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  };
  const handleFetchCarryPlans = async () => {
    const res = await API.fetchCarryPlans();
    if (res.success) {
      setCarryPlanOptions(formatCarryPlansOptions(res.data));
    }
  };

  const GPSignerUsers = useMemo(() => {
    const GPSigners = filter(adminUsers, (user) => {
      return (
        filter(user.groups, (group) => group.name === GP_SIGNER_GROUP).length >
        0
      );
    });
    return map(GPSigners, (user) => {
      return {
        value: user.id,
        label: `${user.user.first_name} ${user.user.last_name}`,
      };
    });
  }, [adminUsers]);

  const getInitialValues = () => {
    const defaultValues = {
      document_type: null,
      name: "",
      description: "",
      document_file: null,
      document_file_changed: false,
      carry_plan: [],
      require_signature: false,
      require_wet_signature: false,
      require_gp_signature: false,
      gp_signer: null,
      show_setting: null,
    };

    if (isEmpty(initState)) {
      return defaultValues;
    } else {
      const {
        id,
        document_status,
        name,
        description,
        document_type,
        document,
        carry_plans_display,
        require_signature,
        require_wet_signature,
        require_gp_signature,
        gp_signer,
        show_everytime,
      } = initState as Record<string, any>;
      return {
        ...defaultValues,
        id,
        document_status,
        name,
        description,
        document_type: docTypeOptions.find(
          (opt) => opt.value === document_type
        ),
        document_file: document,
        carry_plan: filter(carryPlanOptions, (item) =>
          carry_plans_display.includes(item.value)
        ),
        require_signature,
        require_wet_signature,
        require_gp_signature,
        gp_signer: GPSignerUsers.find((opt) => opt.value === gp_signer),
        show_setting: showSettingsOptions.find((opt) =>
          show_everytime ? opt.value === "every_time" : opt.value === "once"
        ),
      };
    }
  };

  useEffect(() => {
    handleFetchCarryPlans();
  }, []);

  const handleConfirmToggle = (dat: any) => {
    handleToggleActivateDoc(dat);
    setShowConfirmation(false);
  };

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);
    const formData = new FormData();
    if (values.document_file && (get(values,'document_file_changed',false)? true: !get(values, "id")))
      formData.append("document_file", values.document_file);

    formData.append("name", values.name);
    formData.append("description", values.description);

    if (get(values, "document_file")) {
      const requireSignature= values.require_signature
      formData.append("require_signature", requireSignature);
      formData.append("require_wet_signature", requireSignature? values.require_wet_signature:false);
      formData.append("require_gp_signature",requireSignature? values.require_gp_signature:false);

      const gpSigner = get(values.gp_signer, "value");
      if (!isNil(gpSigner) && requireSignature && values.require_gp_signature)
        formData.append("gp_signer", gpSigner);
    }
    const docType = get(values, "document_type.value");
    formData.append("document_type", docType);

    if (docType === 1 && get(values, "show_setting.value")) {
      const showEverytime = get(values, "show_setting.value") === "every_time";
      formData.append("show_everytime", showEverytime.toString());
    }

    const carryPlanIds = get(values, "carry_plan").map(
      (plan: any) => plan.value
    );
    formData.append("carry_plans", carryPlanIds);

    const res = await (get(values, "id")
      ? API.editCarryDocument(get(values, "id"), formData)
      : API.createCarryDocument(formData));
    if (res.success) {
      closeModal(true);
    }

    setSubmitting(false);
  };
  return (
    <Container fluid>
      <Formik
        onSubmit={onSubmit}
        enableReinitialize
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
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
          const hasErrors = !!Object.keys(errors).length;
          console.log(values,'vals')
          return (
            <StyledForm
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <h5>Carry Template Document</h5>
              <p>
                Upload Carry Program Documents to be sent to participants to
                review, acknowledge or sign when accepting or forfeiting their
                carry allocation
              </p>

              {/* <RadioField
                label="Select document type"
                name="document_type"
                // className="leverage-radio"
                onChange={(value: any) => setFieldValue("document_type", value)}
                options={docTypeOptions}
                value={get(values, "document_type")}
                vertical
              /> */}

              <CustomRadioGroup
                title="Select document type"
                name="document_type"
                onChange={(value: any) => setFieldValue("document_type", value)}
                options={docTypeOptions}
                value={get(values, "document_type")}
                error={get(errors,'document_type')}
              />
<MaxWidth max="348px">
              <FormTextFieldRow
                label="Document Name"
                placeholder=""
                name="name"
                onChange={(value: any) => setFieldValue("name", value)}
                value={get(values, "name")}
                error={get(errors,'name')}
              />

              <FormTextFieldRow
                label="Document Description"
                placeholder=""
                name="description"
                onChange={(value: any) => setFieldValue("description", value)}
                value={get(values, "description")}
                error={get(errors,'description')}
              />

              {/* <FormSelectorFieldRow
                label="Select Carry Plan"
                placeholder=""
                isMulti
                name="carry_plan"
                options={carryPlanOptions}
                onChange={(value: any) => setFieldValue("carry_plan", value)}
                value={get(values, "carry_plan")}
              /> */}

              <CheckboxSelector
                label="Select Carry Plan"
                options={carryPlanOptions}
                selectedOptions={get(values, "carry_plan")}
                onChange={(value: any) => setFieldValue("carry_plan", value)}
                name="carry_plan"
              />
</MaxWidth>
              <Row className={"mt-2 mb-3"}>
                <Col md={12} className="field-label">
                  Upload Document
                </Col>
                <Col md={12}>
                  <DocumentUploadWrapper>
                    <Form.Group controlId="formFilterValue">
                      {values.document_file ? (
                        <DocTag
                          documentName={
                            values.document_file?.name ||
                            values.document_file?.title
                          }
                          handleDelete={() =>{
                            setFieldValue("document_file", "");
                            setFieldValue("document_file_changed", true);
                          }
                          }
                          // disabled={!isEmpty(initState)}
                        />
                      ) : (
                        <DocumentDropZone
                          onFileSelect={(file) => {
                            setFieldValue("document_file", file);
                          }}
                          // disabled={!isEmpty(initState)}
                        />
                      )}
                    </Form.Group>
                    {get(errors,'document_file') && <p className="text-danger">Required</p>}
                  </DocumentUploadWrapper>
                </Col>
              </Row>

              {!isEmpty(get(values, "document_file")) && (
                <MaxWidth max="348px">
                  <h4>Signature Settings</h4>
                  <SimpleCheckbox
                    label="Require Signature"
                    isChecked={get(values, "require_signature")}
                    onChange={(value: any) =>
                      setFieldValue("require_signature", value)
                    }
                  />
                  {get(values, "require_signature") && (
                    <>
                      {!get(values, "require_gp_signature")  && (
                        <SimpleCheckbox
                          label="Require Wet Signature"
                          isChecked={get(values, "require_wet_signature")}
                          onChange={(value: any) =>
                            setFieldValue("require_wet_signature", value)
                          }
                        />
                      )}

                      {!get(values, "require_wet_signature")  && (
                        <>
                          <SimpleCheckbox
                            label="Require GP Signature"
                            isChecked={get(values, "require_gp_signature")}
                            onChange={(value: any) =>
                              setFieldValue("require_gp_signature", value)
                            }
                          />
                          {get(values, "require_gp_signature") && (
                            <div style={{ marginLeft: "10px" }}>
                              <FormSelectorFieldRow
                                label="Select GP Signer"
                                placeholder=""
                                name="gp_signer"
                                options={GPSignerUsers}
                                onChange={(value: any) =>
                                  setFieldValue("gp_signer", value)
                                }
                                value={get(values, "gp_signer")}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </MaxWidth>
              )}

              {get(values, "document_type")?.value === 1 && (
                // <RadioField
                //   label="Show Settings"
                // name="show_setting"
                // onChange={(value: any) =>
                //   setFieldValue("show_setting", value)
                // }
                // options={showSettingsOptions}
                // value={get(values, "show_setting")}
                //   vertical
                // />
                <MaxWidth max="572px">
                <CustomRadioGroup
                  title="Frequency Settings"
                  name="show_setting"
                  onChange={(value: any) =>
                    setFieldValue("show_setting", value)
                  }
                  options={showSettingsOptions}
                  value={get(values, "show_setting")}
                />
                </MaxWidth>
              )}
              <ButtonsContainer
                className="text-right"
                style={{
                  display: "flex",
                  justifyContent: !isEmpty(initState)
                    ? "space-between"
                    : "flex-end",
                }}
              >
                {!isEmpty(initState) ? (
                  get(values, "document_status") ? (
                    <DangerButton onClick={() => setShowConfirmation(true)}>
                      Deactivate
                    </DangerButton>
                  ) : (
                    <SecondaryButton onClick={() => setShowConfirmation(true)}>
                      Activate
                    </SecondaryButton>
                  )
                ) : null}
                <div>
                  <OutlinedButton
                    style={{
                      padding: "12px 26px 12px 26px !important",
                      height: "48px !important",
                    }}
                    onClick={handleClose}
                  >
                    Cancel
                  </OutlinedButton>
                  <SecondaryButton
                    type="submit"
                    disabled={isSubmitting || hasErrors}
                  >
                    {isEmpty(initState) ? "Create" : "Save"}
                  </SecondaryButton>
                </div>
              </ButtonsContainer>
              {showConfirmation && (
                <ConfirmationModal
                  title={`${
                    get(values, "document_status") ? "Deactivate" : "Activate"
                  } document`}
                  description={
                    get(values, "document_status")
                      ? confirmationDescription.deactivate(get(values, "name"))
                      : confirmationDescription.activate(get(values, "name"))
                  }
                  data={values}
                  handleConfirm={handleConfirmToggle}
                />
              )}
            </StyledForm>
          );
        }}
      </Formik>
    </Container>
  );
};

export default CreateDocumentForm;
