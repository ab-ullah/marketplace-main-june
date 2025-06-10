import * as Yup from "yup";


export const VALIDATION_SCHEMA = Yup.object({
  token: Yup.string().required("Required"),
  company: Yup.object(
    {
      value: Yup.number().required("Required"),
      label: Yup.string().required("Required")
    },
  ),
});

export const INITIAL_VALUES = {
  company: null,
  token: '',
};