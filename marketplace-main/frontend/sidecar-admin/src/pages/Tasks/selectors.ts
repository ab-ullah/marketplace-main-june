import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectTaskCount = createSelector(
  (state: RootState) => state.tasksState.taskCount, (state) => state
);

export const selectAllTasks = createSelector(
  (state: RootState) => state.tasksState.tasksInfo, (state) => state
);

export const selectTaskFilters = createSelector(
    (state: RootState) => state.tasksState.filters, (state) => state
);
