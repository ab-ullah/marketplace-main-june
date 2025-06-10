import { get } from "lodash";
import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectFirmNotices = createSelector(
  (state: RootState) => get(state, 'firmNoticeDetailState.firmNotices'), (state) => state
);

export const selectFirmNoticesValuations = createSelector(
  (state: RootState) => get(state, 'firmNoticeDetailState.firmNoticesValuations'), (state) => state
);