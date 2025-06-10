import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectTaskReviewDetail = createSelector(
  (state: RootState) => state.taskReviewState.task, (state) => state
);

export const selectWorkFlowComments = createSelector(
  (state: RootState) => state.taskReviewState.comments, (state) => state
);
