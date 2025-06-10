import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";


export const selectPreviewFundMarketingPage = createSelector(
  (state: RootState) => state.previewMarketingPagesState.previewFundPage, (state) => state
);

