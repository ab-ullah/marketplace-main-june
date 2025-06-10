import * as Yup from "yup";

export const INITIAL_VALUES = {
  first_name: "",
  last_name: "",
  entity_name: "",
  add_as_entity:false,
  email: null,
} as Record<string,any>;

export const VALIDATION_SCHEMA = Yup.object({
  first_name: Yup.string().required("Required"),
  last_name: Yup.string().required("Required"),
  email: Yup.object({
    label: Yup.string().email("Invalid email format").required("Email is required"),
  }).nullable(),
  add_as_entity: Yup.boolean(),
  entity_name: Yup.string().when('add_as_entity', {
    is: true,
    then: Yup.string().required('Entity name is required'),
    otherwise: Yup.string().notRequired(),
  }),
});