export interface ISelectOption {
  value: string;
  label: string;
}

export interface IApplicantInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: null | ISelectOption;
  jobBand: null | ISelectOption;
  entityType: null | ISelectOption;
  officeLocation: null | ISelectOption;
  whereWereYouWhenYouDecidedToInvest: null | ISelectOption;
}
