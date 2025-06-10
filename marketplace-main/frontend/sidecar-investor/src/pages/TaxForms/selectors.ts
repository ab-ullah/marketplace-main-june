import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectAppRecords = createSelector(
  (state: RootState) => state.taxFormsState, (state) => state
);

export const selectGeoSelector = createSelector(
  (state: RootState) => state.taxFormsState.geoSelector, (state) => state
);