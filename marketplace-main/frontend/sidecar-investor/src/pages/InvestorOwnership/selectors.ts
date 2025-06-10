import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectInvestorOwnership = createSelector(
  (state: RootState) => state.investorOwnershipState.investor, (state) => state
);

export const selectNotifications = createSelector(
  (state: RootState) => state.investorOwnershipState.notificationInfo, (state) => state
);

export const selectNotificationFilters = createSelector(
  (state: RootState) => state.investorOwnershipState.filters, (state) => state
);

export const selectShowUSD = createSelector(
  (state: RootState) => state.investorOwnershipState.showUSD, (state) => state
);

export const selectCurrency = createSelector(
  (state: RootState) => state.investorOwnershipState.selectedCurrency, (state) => state
);

export const selectInvestorCurrencies = createSelector(
  (state: RootState) => state.investorOwnershipState.investorCurrencies, (state) => state
);
