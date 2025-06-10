import {RootState} from "../../app/store";
import {createSelector} from "@reduxjs/toolkit";


export const selectFundCriteriaPreview = createSelector(
  (state: RootState) => state.eligibilityCriteriaPreviewState.fundCriteriaDetail, (state) => state
);

export const selectAnswers = createSelector(
  (state: RootState) => state.eligibilityCriteriaPreviewState.previewAnswers, (state) => state
);

export const selectLogicFlowValues = createSelector(
  (state: RootState) => state.eligibilityCriteriaPreviewState.logicFlowValues, (state) => state
);

export const selectUserFileText = createSelector(
  (state: RootState) => state.eligibilityCriteriaPreviewState.userFilesText, (state) => state
);

export const selectApplicantInfo = createSelector(
  (state: RootState) => state.eligibilityCriteriaPreviewState.applicantInfo, (state) => state
);

export const selectSelectedOption = createSelector(
  (state: RootState) => state.eligibilityCriteriaPreviewState.selectedOption, (state) => state
);

export const selectRenderedBlockIds = createSelector(
  (state: RootState) => state.eligibilityCriteriaPreviewState.renderedBlockIds, (state) => state
);