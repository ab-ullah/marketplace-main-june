import * as Yup from "yup";

export const INVESTOR_TYPE_OPTIONS = [
    { value: "Individual", label: "Individual" },
    { value: "Entity", label: "Entity" },
  ]

export const QUESTION_LABELS_MAPPINGS: any = {
  'investor_name': 'Name',
  'investment_type': 'Are you investing as an individual or an entity?',
  'investment_amount': 'How much equity would you like to invest?'
}

export const getSchemaValidation = (minInvestment = 10000, currencySymbol = "$", currencyCode = "USD") => Yup.object({
    'investor_name': Yup.string().required("Required"),
    'investment_type': Yup.string().required("Required"),
    'investment_amount': Yup.number().test(
      'min-limit',
      `Investment amount must be greater than or equal to ${currencySymbol} ${minInvestment} ${currencyCode}`,
      //@ts-ignore
      value => parseFloat(value) >= minInvestment,
    ),
  });
  