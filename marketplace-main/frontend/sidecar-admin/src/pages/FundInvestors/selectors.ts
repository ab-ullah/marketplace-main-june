import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectFund = createSelector(
  (state: RootState) => state.fundInvestorsState.fund, (state) => state
);