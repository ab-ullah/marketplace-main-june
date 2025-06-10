import get from "lodash/get";

export enum IStatus {
  Approved = "Approved",
  Pending = "Pending",
  NotEligible = "Not Eligible",
  GPSigned = "GP Signed",
  Decline = "Decline",
  UpdatePending = "Update pending",
  Complete = "Complete",
  NA = "Not Started",
}

export const colors = {
  [IStatus.Approved]: "#10AC84",
  [IStatus.GPSigned]: "#10AC84",
  [IStatus.Pending]: "#E37628",
  [IStatus.NotEligible]: "#B0BEC5",
  [IStatus.Decline]: "#9C1D1D",
  [IStatus.UpdatePending]: "#2E86DE",
  [IStatus.Complete]: "#10AC84",
  [IStatus.NA]: "#B0BEC5",
};


export const getPillsColor = (row: object, column: string, defaultValue?: string) => {
  const defaultStatus = defaultValue ? defaultValue : IStatus.NA
  const value = get(row, column, defaultStatus);
  return get(colors, value, "#B0BEC5");
};

export const MAX_FILE_SIZE = 25000000;