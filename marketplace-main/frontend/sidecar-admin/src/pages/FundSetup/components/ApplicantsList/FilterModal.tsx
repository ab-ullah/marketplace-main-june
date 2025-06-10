import { FunctionComponent, memo } from "react";
import Modal from "react-bootstrap/Modal";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import { Formik } from "formik";
import * as Yup from "yup";
import Button from "react-bootstrap/Button";
import { FormSelectorFieldRow } from "../../../../components/Form/SelectorField";
import { EditApplicantWrapper, FilterButtonsWrapper, FilterModalFooter } from "./styles";

interface IFilterModal {
  show: boolean;
  options: any;
  selectedFilter: any;
  handleSubmitFilter: (values: any) => void;
  handleClose: () => void;
  handleClearFilter: (values: any) => void;
}

const VALIDATION_SCHEMA = Yup.object({
  band_level: Yup.string(),
  office_location: Yup.string(),
  department: Yup.string(),
  region: Yup.string(),
  application_approval: Yup.string(),
});

const DEFAULT_FILTER = {
  job_band: "",
  office_location: "",
  department: "",
  application_approval: "",
  eligibility_country: "",
  eligibility_decision: "",
  requested_equity: "",
  kyc_aml: "",
  legalDocs: "",
  taxReview: "",
};

const fields = [
  { field: "application_approval", label: "Application Approval" },
  {field:"kyc_aml", label:"KYC/AML"},
  {field:"taxReview", label:"Tax Review"},
  {field:"legalDocs", label:"Legal Docs - Final Review"},
  { field: "job_band", label: "Job Band/Level" },
  { field: "office_location", label: "Office Location" },
  { field: "department", label: "Department" },
  // { field: "eligibility_country", label: "Region" },
  {field:"eligibility_decision", label:"Eligibility Decision"},
  {field:"requested_equity", label:"Requested Equity"},
];

const FilterModal: FunctionComponent<IFilterModal> = ({
  show,
  options,
  selectedFilter,
  handleSubmitFilter,
  handleClose,
  handleClearFilter,
}) => {

  const getInitialValues = () => {
    return {
      job_band: get(selectedFilter, 'job_band', ''),
      office_location: get(selectedFilter, 'office_location', ''),
      department: get(selectedFilter, 'department', ''),
      eligibility_country: get(selectedFilter, 'eligibility_country', ''),
      application_approval: get(selectedFilter, 'application_approval', ''),
      eligibility_decision: get(selectedFilter, 'eligibility_decision', ''),
      requested_equity: get(selectedFilter, 'requested_equity', ''),
      kyc_aml: get(selectedFilter, 'kyc_aml', ''),
      legalDocs: get(selectedFilter, 'legalDocs', ''),
      taxReview: get(selectedFilter, 'taxReview', ''),

    }
  }
  return (
    <Modal size={"lg"} show={show} onHide={handleClose}>
      <Modal.Header>
        <Modal.Title>Filter applicants</Modal.Title>
      </Modal.Header>

      <Formik
        validationSchema={VALIDATION_SCHEMA}
        initialValues={getInitialValues()}
        onSubmit={handleSubmitFilter}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isValid,
          isSubmitting,
          setFieldValue,
          errors,
        }) => {
          return (
            <>
              <Modal.Body className="p-0">
                <EditApplicantWrapper>
                  {fields.map((field) => (
                    <FormSelectorFieldRow
                      label={field.label}
                      name={field.field}
                      placeholder="Select"
                      onChange={(value: any) =>
                        setFieldValue(field.field, value.value)
                      }
                      onBlur={handleBlur}
                      value={{
                        label: get(values, field.field, ""),
                        value: get(values, field.field, ""),
                      }}
                      options={[
                        { label: "Select", value: "" },
                        ...uniqBy(options[field.field], "value"),
                      ]}
                    />
                  ))}
                </EditApplicantWrapper>
              </Modal.Body>
              <FilterModalFooter>
                <Button variant="outline-primary" onClick={() => handleClearFilter(DEFAULT_FILTER)}>Clear</Button>
                <FilterButtonsWrapper>
                <Button variant="outline-primary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => handleSubmit()}>
                  Apply Filters
                </Button>
                </FilterButtonsWrapper>
              </FilterModalFooter>
            </>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default memo(FilterModal);
