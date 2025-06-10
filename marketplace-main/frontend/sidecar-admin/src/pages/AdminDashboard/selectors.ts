import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectAdminStat = createSelector(
  (state: RootState) => state.adminDashboardState.adminStats, (state) => state
);