import * as Yup from "yup";

export const INITIAL_VALUES = {
  source: null,
  participant: null,
  total_capital_commit: "",
  cashless_commit: "",
  management_fee_offset: "",
  salary_reduction: "",
};

export const VALIDATION_SCHEMA = Yup.object({
  source: Yup.object().required("Required").nullable(),
  participant: Yup.object().required("Required").nullable(),
});

export const SOURCE_TYPE = {
  FUND: 1,
  DEAL: 2,
  INVESTMENT_TRANCHE: 3,
};
