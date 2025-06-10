import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectFund = createSelector(
  (state: RootState) => state.fundDetailState.fund, (state) => state
);

export const selectFundDetail = createSelector(
  (state: RootState) => state.fundDetailState.fundDetail, (state) => state
);