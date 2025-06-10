import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectNotices = createSelector(
  (state: RootState) => state.noticesState.noticeDetails, (state) => state
);

export const selectNoticesValuation = createSelector(
  (state: RootState) => state.noticesState.noticeValuationDetails, (state) => state
);

export const selectShowUSD = createSelector(
  (state: RootState) => state.noticesState.showUSD, (state) => state
);

