import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectApplicants = createSelector(
  (state: RootState) => state.fundSetupReducer.applicants, (state) => state
);

export const selectVehicles = createSelector(
  (state: RootState) => state.fundSetupReducer.vehicles, (state) => state
);

export const selectFilter = createSelector(
  (state: RootState) => state.fundSetupReducer.filter, (state) => state
);

export const selectStatuses = createSelector(
  (state: RootState) => state.fundSetupReducer.applicant_status, (state) => state
);