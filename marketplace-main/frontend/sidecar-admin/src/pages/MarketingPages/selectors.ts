import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectMarketingPages = createSelector(
  (state: RootState) => state.marketingPagesState.marketingPages, (state) => state
);

export const selectFetchingState = createSelector(
  (state: RootState) => state.marketingPagesState.isFetching, (state) => state
);