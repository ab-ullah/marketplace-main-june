import get from "lodash/get";

export enum IStatus {
  Approved = "Approved",
  Pending = "Pending",
  NotEligible = "Not Eligible",
  Decline = "Decline",
  UpdatePenging = "Update penging",
  Complete = "Complete",
  NA = "Not Started",
  GPSigned = "GP Signed"
}

export const colors = {
  [IStatus.Approved]: "#10AC84",
  [IStatus.Pending]: "#E37628",
  [IStatus.NotEligible]: "#B0BEC5",
  [IStatus.Decline]: "#9C1D1D",
  [IStatus.UpdatePenging]: "#2E86DE",
  [IStatus.Complete]: "#10AC84",
  [IStatus.NA]: "#B0BEC5",
  [IStatus.GPSigned]: "#10AC84",
};


export const getPillsColor = (row: object, column: string, defaultValue?: string) => {
  const defaultStatus = defaultValue ? defaultValue : IStatus.NA
  const value = get(row, column, defaultStatus);
  return get(colors, value, "#B0BEC5");
};


export const WORKFLOW_ELIGIBILITY = 1
export const WORKFLOW_INDICATION_OF_INTEREST = 2
export const WORKFLOW_AML_KYC = 3
export const WORKFLOW_USER_ON_BOARDING = 4
export const WORKFLOW_TAX_RECORD = 5
export const WORKFLOW_AGREEMENTS = 6
export const WORKFLOW_ALLOCATION = 7
export const WORKFLOW_GP_SIGNING = 8
export const WORKFLOW_INTERNAL_TAX_REVIEW = 9
export const WORKFLOW_CAPITAL_CALL = 10
export const WORKFLOW_DISTRIBUTION_NOTICE = 11
export const WORKFLOW_CARRY_PLAN = 12
export const WORKFLOW_PRE_DOCUMENT_SIGNING = 13
