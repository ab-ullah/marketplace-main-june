import * as Yup from "yup";

export const INITIAL_VALUES = {
  "file_data": null,
  "field_id": null,
}


export const VALIDATION_SCHEMA = Yup.object({
  "field_id": Yup.object().shape({
    label: Yup.string().required("Required"),
    value: Yup.string().required("Required"),
  }).nullable().required('Please select a document type'),
});