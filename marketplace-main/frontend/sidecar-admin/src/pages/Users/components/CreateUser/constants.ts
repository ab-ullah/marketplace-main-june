import * as Yup from "yup";


export const VALIDATION_SCHEMA = Yup.object({
  email: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
});

export const INITIAL_VALUES = {
  email: undefined,
  firstName: undefined,
  lastName: undefined,
};