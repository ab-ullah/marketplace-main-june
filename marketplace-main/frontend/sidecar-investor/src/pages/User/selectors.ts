import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectUserInfo = createSelector(
  (state: RootState) => state.userState.userInfo, (state) => state
);

export const selectUnreadNotificationCount = createSelector(
  (state: RootState) => state.userState.unreadNotificationCount, (state) => state
);

export const selectCompanyUsers = createSelector(
  (state: RootState) => state.userState.companyUsers, (state) => state
);

export const selectConsiderationUsers = createSelector(
  (state: RootState) => state.userState.considerationCompanyUsers, (state) => state
);

export const selectAdvisorUsers = createSelector(
  (state: RootState) => state.userState.advisorUsers, (state) => state
);

