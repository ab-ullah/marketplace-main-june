import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectFundInvestorDetail = createSelector(
  (state: RootState) => state.fundInvestorDetailState.fundInvestments, (state) => state
);

export const selectInvestorProfiles = createSelector(
  (state: RootState) => state.fundInvestorDetailState.investorProfiles, (state) => state
);

export const selectInvestorProfileOptions = createSelector(
  (state: RootState) => state.fundInvestorDetailState.investorProfiles.map(
    (investor) => ({label: investor.name, value: investor.id})
  ), (state) => state
);