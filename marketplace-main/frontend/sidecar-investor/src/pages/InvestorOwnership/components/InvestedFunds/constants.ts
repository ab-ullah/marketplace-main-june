import * as Yup from "yup";


export const VALIDATION_SCHEMA = Yup.object({
  requestedSale: Yup.number().positive().min(1).required("Required"),
});

export const INITIAL_VALUES = {
  requestedSale: 0,
};