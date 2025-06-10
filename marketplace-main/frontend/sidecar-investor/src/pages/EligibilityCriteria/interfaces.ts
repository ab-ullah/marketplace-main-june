import {ISelectOption} from "../../interfaces/form";

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
