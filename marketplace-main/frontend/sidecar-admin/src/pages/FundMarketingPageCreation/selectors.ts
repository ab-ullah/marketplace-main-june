import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";


export const selectFundMarketingPageDetail = createSelector(
  (state: RootState) => state.fundMarketingPageState.fundMarketingPage, (state) => state
);

export const selectIcons = createSelector(
  (state: RootState) => state.fundMarketingPageState.icons, (state) => state
);
