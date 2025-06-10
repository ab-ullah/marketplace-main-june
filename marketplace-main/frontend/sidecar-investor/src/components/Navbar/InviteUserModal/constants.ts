import * as Yup from "yup";

export const VALIDATION_SCHEMA = Yup.object({
  email: Yup.string().required("Required"),
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  accessLevels: Yup.array()
    .min(1, "Please select atleast one permission")
    .required("Required"),
});

export const INITIAL_VALUES = {
  email: undefined,
  firstName: undefined,
  lastName: undefined,
  accessLevels: [] as number[],
};

export const PERMISSIONS_LIST = [
  { name: "Access and export financial data", id: 1 },
  { name: "Access investment applications", id: 2 },
];
