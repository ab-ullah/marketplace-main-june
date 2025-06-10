import * as Yup from "yup";
import {ISelectOption} from "../../../OpportunityOnboarding/interfaces";


export const INVESTOR_TYPE_OPTIONS = [
  {label: 'As an Individual', value: 'INDIVIDUAL'},
  {label: 'As a Corporate Entity', value: 'PRIVATE_COMPANY'},
  {label: 'As a Partnership', value: 'LIMITED_PARTNERSHIP'},
  {label: 'As a Trust', value: 'TRUST'},
]

export const DEPARTMENTS = [
  {label: 'General Management / Business Operations', value: 'general-management-business-operations'},
  {label: 'Portfolio & Fund Management', value: 'portfolio-&-fund-management'},
  {label: 'Transactions / Acquisitions', value: 'transactions-acquisitions'},
  {label: 'Asset Management', value: 'asset-management'},
  {label: 'Research & Strategy', value: 'research-strategy'},
  {label: 'Investor Accounting & Finance', value: 'accounting-&-finance'},
  {label: 'Investor Relations - Relationship Managers', value: 'investor-relations/relationship-managers'},
  {label: 'Investor Relations - Project Management', value: 'investor-relations/pm'},
  {label: 'PWG', value: 'pwg'},
  {label: 'Investor Services', value: 'investor-services'},
  {label: 'Tax', value: 'tax'},
  {label: 'Legal & Compliance', value: 'legal-&-compliance'},
  {label: 'Technology', value: 'technology'},
  {label: 'Corporate Accounting & Finance', value: 'corporate-accounting-&-finance'},
  {label: 'Marketing & Communications', value: 'marketing-communications'},
  {label: 'Human Resources', value: 'hr'},
  {label: 'ESG / Sustainability', value: 'esg'},
  {label: 'Administration (assistants & office managers)', value: 'admin'},
  {label: 'Other', value: 'other'}
]

export const JOB_BANDS = [
      { label: "Business Support 1", value: "Business Support 1" },
  { label: "Business Support 2", value: "Business Support 2" },
  { label: "Business Support 3", value: "Business Support 3" },
  { label: "Business Support 4", value: "Business Support 4" },
  { label: "Business Support 5", value: "Business Support 5" },
  { label: "Portfolio and Fund Investment 1", value: "Portfolio and Fund Investment 1" },
  { label: "Portfolio and Fund Investment 2", value: "Portfolio and Fund Investment 2" },
  { label: "Portfolio and Fund Investment 3", value: "Portfolio and Fund Investment 3" },
  { label: "Portfolio and Fund Investment 4", value: "Portfolio and Fund Investment 4" },
  { label: "Portfolio and Fund Investment 5", value: "Portfolio and Fund Investment 5" },
  { label: "Leadership 1", value: "Leadership 1" },
  { label: "Leadership 2", value: "Leadership 2" },
  { label: "Leadership 3", value: "Leadership 3" },
  { label: "Leadership 4", value: "Leadership 4"},
  { label: "Management 1", value: "Management 1" },
  { label: "Management 2", value: "Management 2" },
  { label: "Management 3", value: "Management 3" },
  { label: "Management 4", value: "Management 4" },
  { label: "Management 5", value: "Management 5" },
  { label: "Professional 1", value: "Professional 1" },
  { label: "Professional 2", value: "Professional 2" },
  { label: "Professional 3", value: "Professional 3" },
  { label: "Professional 4", value: "Professional 4" },
  { label: "Professional 5", value: "Professional 5" },
  { label: "Professional 6", value: "Professional 6" },
  { label: "Producer 1", value: "Producer 1" },
  { label: "Producer 2", value: "Producer 2" },
  { label: "Producer 3", value: "Producer 3" },
  { label: "Producer 4", value: "Producer 4" },
  { label: "Producer 5", value: "Producer 5" },
  { label: "Producer 6", value: "Producer 6" },
  { label: "Producer 7", value: "Producer 7" },
  { label: "Specialist 1", value: "Specialist 1"},
  { label: "Specialist 2", value: "Specialist 2"},
  { label: "Specialist 3", value: "Specialist 3"},
  { label: "Specialist 4", value: "Specialist 4"},

]

export const VALIDATION_SCHEMA = Yup.object({
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  jobTitle: Yup.string().required("Required"),
  entityType: Yup.object().shape({
    label: Yup.string().required("Required"),
    value: Yup.string().required("Required")
  }).required("Required").nullable(),
  jobBand: Yup.object().shape({
    label: Yup.string().required("Required"),
    value: Yup.string().required("Required")
  }).required("Required").nullable(),
  whereWereYouWhenYouDecidedToInvest: Yup.object().shape({
    label: Yup.string().required("Required"),
    value: Yup.string().required("Required")
  }).required("Required").nullable(),
  department: Yup.object().shape({
    label: Yup.string().required("Required"),
    value: Yup.string().required("Required")
  }).required("Required").nullable()
});

export interface IApplicantInfoFormValues  {
  firstName: string,
  lastName: string,
  jobTitle: string,
  officeLocation: ISelectOption | null,
  entityType: string,
  department: ISelectOption | null,
  jobBand: ISelectOption | null,
}

export const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  officeLocation: null,
  entityType: undefined,
  department: DEPARTMENTS[0],
  jobBand: JOB_BANDS[0],

};