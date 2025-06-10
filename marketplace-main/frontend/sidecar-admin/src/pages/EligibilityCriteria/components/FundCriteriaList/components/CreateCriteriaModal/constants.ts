import * as Yup from "yup";

export const VALIDATION_SCHEMA = Yup.object({
  country: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required("Required"),
        value: Yup.string().required("Required"),
      })
    )
    .min(1, 'Required'),
});

export const INITIAL_VALUES = {
  country: [],
  isSmartViewEnabled: false
};
