import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectFundProfile = createSelector(
  (state: RootState) => state.fundProfileInfo.fund, (state) => state
);