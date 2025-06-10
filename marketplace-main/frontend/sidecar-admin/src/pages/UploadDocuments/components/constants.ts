import * as Yup from "yup";


export const VALIDATION_SCHEMA = Yup.object({
  title: Yup.string().required("Required"),
  files: Yup.array().required("Required")
});

export const INITIAL_VALUES = {
  title: undefined,
  files: [],
};