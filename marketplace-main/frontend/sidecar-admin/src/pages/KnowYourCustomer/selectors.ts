import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectKYCState = createSelector(
    (state: RootState) => state.knowYourCustomerState, (state) => state
);

export const makeDocumentSelector = () => createSelector(
    (state: RootState) => state.knowYourCustomerState.documents,
    (_: RootState, recordId: number) => recordId,
    (documents, recordId) => documents[recordId]
);

export const selectTaxRecords = createSelector(
    (state: RootState) => state.taxFormsState, (state) => state
);

export const selectApplicationInfo = createSelector(
  (state: RootState) => state.knowYourCustomerState.applicationInfo, (state) => state
);