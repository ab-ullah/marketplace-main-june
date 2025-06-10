import * as Yup from "yup";

export const POLITICALLY_EXPOSED_OPTIONS = [
    { value: 'yes', label: "Yes" },
    { value: 'no', label: "No" },
];

export const ID_DOCUMENT_TYPES = [
    {
      value: 1,
      label: 'Passport'
    },
    {
      value: 2,
      label: 'Driver\'s license'
    },
    {
      value: 3,
      label: 'SSN card'
    },
    {
      value: 4,
      label: 'National ID card'
    },
    {
      value: 5,
      label: 'Other'
    }
]

export const PARTICIPANT_PROFILE_VALIDATION_SCHEMA = Yup.object({
    "first_name": Yup.string().required("Required"),
    "last_name": Yup.string().required("Required"),
    "phone_number": Yup.string().required("Required"),
    "date_of_birth": Yup.string().required("Required"),
    "home_address": Yup.string().required("Required"),
    "home_city": Yup.string().required("Required"),
    "citizenship_country": Yup.object().required("Required"),
    "pollitically_exposed_person": Yup.object().required("Required"),
    "department": Yup.object().required("Required"),
    "job_title": Yup.string().required("Required"),
    "office_location": Yup.object().required("Required"),
    "job_band": Yup.object().required("Required"),
});

export const PARTICIPANT_ENTITY_VALIDATION_SCHEMA = Yup.object({
    "date_of_formation": Yup.string().required("Required"),
    "entity_name": Yup.string().required("Required"),
    "entity_title": Yup.string().required("Required"),
    "nature_of_business": Yup.string().required("Required"),
    "home_address": Yup.string().required("Required"),
    "home_city": Yup.string().required("Required"),
    "registered_address": Yup.string().required("Required"),
    "job_title": Yup.string().required("Required")
});

export const BASE_DOCUMENT_SCHEMA = Yup.object({
    "id_document_type": Yup.object().required("Required"),
    "id_issuing_country": Yup.object().required("Required"),
    "number_of_id": Yup.string().required("Required")
});

const PARTICIPANT_FIELDS = Yup.object({
    "first_name": Yup.string().required("Required"),
    "last_name": Yup.string().required("Required"),
});

export const EDIT_PARTICIPANT_SCHEMA = PARTICIPANT_FIELDS.concat(BASE_DOCUMENT_SCHEMA);

export const EMPLOYEE_STATUS_OPTIONS = [
  {
    label: 'Active',
    value: 'active'
  },
  {
    label: 'Inactive',
    value: 'inactive'
  }
]