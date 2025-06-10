import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectOpportunities = createSelector(
  (state: RootState) => state.opportunitiesState.opportunities, (state) => state
);