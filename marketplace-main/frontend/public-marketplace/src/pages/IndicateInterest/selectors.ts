import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectIndicateInterestFund = createSelector(
  (state: RootState) => state.indicateInterest.fund, (state) => state
);