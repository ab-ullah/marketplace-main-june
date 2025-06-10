import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectCompany = createSelector(
  (state: RootState) => state.companyInfo.company, (state) => state
);