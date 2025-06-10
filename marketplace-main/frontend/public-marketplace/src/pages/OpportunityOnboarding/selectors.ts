import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";


export const selectFundCriteriaPreview = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.fundCriteriaDetail, (state) => state
);

export const selectFundCriteriaResponse = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.fundCriteriaResponse, (state) => state
);

export const selectDownloadedDocuments = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.downloadedDocuments, (state) => state
);

export const selectRequiredDocuments = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.requiredDocuments, (state) => state
);

export const selectIsEligible = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.isEligible, (state) => state
);

export const selectCountries = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.geoSelector.filter(geoType => geoType.label.toLowerCase() === 'countries'), (state) => state
);

export const selectSelectedCountry = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.selectedCountry, (state) => state
);

export const selectSelectedVehicle = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.selectedVehicle, (state) => state
);

export const selectError = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.error, (state) => state
);

export const selectApplicantInfo = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.applicantInfo, (state) => state
);

export const selectIsLoading = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.isLoading, (state) => state
);

export const selectDataProtectionPolicy = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.dataProtectionPolicy, (state) => state
);

export const selectFundApplicationDetails = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.fundApplicationDetails, (state) => state
);