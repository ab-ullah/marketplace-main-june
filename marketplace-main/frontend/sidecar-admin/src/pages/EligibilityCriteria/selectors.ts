import find from "lodash/find";
import get from "lodash/get";
import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectEligibilityCriteriaFunds = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.funds,
  (state) => state
);

export const selectSelectedFund = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.selectedFund,
  (state) => state
);

export const selectGeoSelector = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.geoSelector,
  (state) => state
);

export const selectFundTags = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.fundTags,
  (state) => state
);

export const selectCountrySelector = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.geoSelector,
  (state) =>
    get(
      find(state, (data) => data.label === "Countries"),
      "options",
      []
    )
);

export const selectFundCriteria = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.fundEligibilityCriteria,
  (state) => state
);

export const selectfetchingEligibilityCriteria = createSelector(
  (state: RootState) =>
    state.eligibilityCriteriaState.fetchingEligibilityCriteria,
  (state) => state
);

export const selectSelectedCriteria = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.selectedCriteria,
  (state) => state
);

export const selectBlockCategories = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.blockCategories,
  (state) => state
);

export const selectSelectedCriteriaDetail = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.selectedCriteriaDetail,
  (state) => state
);

export const selectAdminFilledRequirement = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.adminRequirementsFilled,
  (state) => state
);

export const selectSmartBlockTemplates = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.templates,
  (state) => state
);

export const selectSelectedTemplate = createSelector(
  (state: RootState) => state.eligibilityCriteriaState.selectedTemplate,
  (state) => state
);
