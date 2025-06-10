import * as Yup from "yup";


export const OFFICE_LOCATIONS = [
  {label: 'Chicago', value: 'chicago'},
  {label: 'Boston', value: 'boston'},
  {label: 'New York', value: 'new york'},
  {label: 'Singapore', value: 'singapore'}
]


export const DEPARTMENTS = [
  {label: 'Accounting', value: 'accounting'},
  {label: 'Admin', value: 'admin'},
  {label: 'Management', value: 'management'},
  {label: 'HR', value: 'hr'}
]

export const JOB_BANDS = [
  {label: 'M5', value: 'M5'},
  {label: 'M4', value: 'M4'},
  {label: 'M3', value: 'M3'},
  {label: 'M2', value: 'M2'}
]

export const TAX_COUNTRY = [
  {label: 'USA', value: 'USA'},
  {label: 'Singapore', value: 'Singapore'},
  {label: 'Canada', value: 'Canada'},
  {label: 'Germany', value: 'Germany'}
]

export const ENTITY_TYPES = [
  {label: 'Individual', value: 'individual'},
  {label: 'Entity', value: 'entity'}
]

export enum LEVERAGE_OPTIONS_LABELS {
  None = 'None',
  '2:1' = '2 : 1',
  '3:1' = '3 : 1',
  '4:1' = '4 : 1',
}

export const LEVERAGE_OPTIONS = [
  {label: LEVERAGE_OPTIONS_LABELS.None, value: 'none', multiple: 0},
  {label: LEVERAGE_OPTIONS_LABELS['2:1'], value: '2:1', multiple: 2},
  {label: LEVERAGE_OPTIONS_LABELS['3:1'], value: '3:1', multiple: 3},
  {label: LEVERAGE_OPTIONS_LABELS['4:1'], value: '4:1', multiple: 4},
]

export const INTERESTED_LEVERAGE_OPTIONS = [
  {label: 'Yes', value: 'yes'},
  {label: 'No', value: 'no'},
]


export const getSchemaValidation = (minInvestment = 10000) => Yup.object({
  name: Yup.string().required("Required"),
  jobTitle: Yup.string().required("Required"),
  entityType: Yup.string().required("Required"),
  interestedInLeverage: Yup.string().when("offerLeverage", {
    is: true,
    then: Yup.string().required("Required")
  }),
  investmentAmount: Yup.number().positive().min(minInvestment).required("Required"),
});


export const getOnBoardingSchema =  (minInvestment = 10000, currencyCode = 'USD') => Yup.object({
  interestedInLeverage: Yup.string().when("offerLeverage", {
    is: true,
    then: Yup.string().required("Required")
  }),
  investmentAmount: Yup.number().positive().min(
    minInvestment, `Investment amount must be greater than or equal to ${currencyCode} ${minInvestment.toLocaleString()}`
  ).required("Required"),
});

export const INITIAL_VALUES = {
  name: '',
  officeLocation: OFFICE_LOCATIONS[0],
  jobTitle: '',
  department: DEPARTMENTS[0],
  jobBand: JOB_BANDS[0],
  entityType: '',
  taxCountry: TAX_COUNTRY[0],
  investmentAmount: 0,
  interestedInLeverage: '',
};