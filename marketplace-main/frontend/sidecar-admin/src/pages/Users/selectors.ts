import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectUsers = createSelector(
  (state: RootState) => state.userState.users, (state) => state
);

export const selectInvestorProfiles = createSelector(
  (state: RootState) => state.userState.investorProfiles, (state) => state
);

export const selectInvestorProfileOptions = createSelector(
  (state: RootState) => state.userState.investorProfiles.map(
    (investor) => ({label: investor.name, value: investor.id})
  ), (state) => state
);

export const selectGroups = createSelector(
  (state: RootState) => state.userState.groups, (state) => state
);
