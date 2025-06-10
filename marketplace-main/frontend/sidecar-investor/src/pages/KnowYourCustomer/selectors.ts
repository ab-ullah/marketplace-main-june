import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectKYCRecord = createSelector(
  (state: RootState) => state.knowYourCustomerState, (state) => state
);