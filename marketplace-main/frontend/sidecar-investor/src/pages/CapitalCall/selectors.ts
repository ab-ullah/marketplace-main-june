import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectCapitalCall = createSelector(
  (state: RootState) => state.capitalCallState.capitalCall, (state) => state
);