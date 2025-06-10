import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectFundDetails = createSelector(
  (state: RootState) => state.indicationOfInterestState.fundDetails, (state) => state
);