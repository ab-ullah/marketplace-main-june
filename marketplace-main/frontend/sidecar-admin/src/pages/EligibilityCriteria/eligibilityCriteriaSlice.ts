import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICriteriaFund } from "../../interfaces/EligibilityCriteria/fund";
import {
  fetchBlockCategories,
  fetchFundsForCriteria,
  fetchGeoSelector,
  fetchFundsTags,
  getFundCriteriaDetail,
  getFundEligibilityCriteria,
  fetchSmartBlockTemplates,
} from "./thunks";
import { IEligibilityCriteria } from "../../interfaces/EligibilityCriteria/criteria";
import {
  EligibilityCriteriaState,
  IAdminRequirement,
  ICriteriaBlockOptionDeleteAction,
  ICriteriaBlockUpdateAction,
} from "./interfaces";

const initialState: EligibilityCriteriaState = {
  funds: [],
  selectedFund: null,
  geoSelector: [],
  fundTags: [],
  fundEligibilityCriteria: [],
  fetchingEligibilityCriteria: false,
  selectedCriteria: null,
  selectedCriteriaDetail: null,
  blockCategories: [],
  adminRequirementsFilled: {},
  templates: [],
  selectedTemplate: null
};

export const eligibilityCriteriaSlice = createSlice({
  name: "eligibilityCriteriaSlice",
  initialState,
  reducers: {
    setSelectedFund: (state, action: PayloadAction<ICriteriaFund>) => {
      state.selectedFund = action.payload;
    },
    setSelectedCriteria: (
      state,
      action: PayloadAction<IEligibilityCriteria>
    ) => {
      state.selectedCriteria = action.payload;
    },
    updateCriteriaBlockPayload: (
      state,
      action: PayloadAction<ICriteriaBlockUpdateAction>
    ) => {
      const payload = action.payload;
      if (state.selectedCriteriaDetail?.id === payload.criteriaId) {
        state.selectedCriteriaDetail.criteria_blocks =
          state.selectedCriteriaDetail.criteria_blocks.map((criteriaBlock) => {
            if (criteriaBlock.id === payload.criteriaBlockId) {
              return { ...criteriaBlock, payload: payload.payload };
            }
            return criteriaBlock;
          });
      }
    },
    deleteCriteriaBlockOption: (
      state,
      action: PayloadAction<ICriteriaBlockOptionDeleteAction>
    ) => {
      const payload = action.payload;
      if (state.selectedCriteriaDetail?.id === payload.criteriaId) {
        state.selectedCriteriaDetail.criteria_blocks =
          state.selectedCriteriaDetail.criteria_blocks.map((criteriaBlock) => {
            if (criteriaBlock.id === payload.criteriaBlockId) {
              const updatedOptions = criteriaBlock.payload.options.filter(
                (option: any) => option.id !== payload.optionId
              );
              return {
                ...criteriaBlock,
                payload: { ...criteriaBlock.payload, options: updatedOptions },
              };
            }
            return criteriaBlock;
          });
      }
    },
    updateAdminAnswer: (state, action: PayloadAction<IAdminRequirement>) => {
      const payload = action.payload;
      const criteriaId = payload.criteriaId;
      const currentAdminAnswers = state.adminRequirementsFilled[criteriaId];
      state.adminRequirementsFilled = {
        ...state.adminRequirementsFilled,
        [criteriaId]: { ...currentAdminAnswers, ...payload.payload },
      };
    },
    clearCriteriaDetail: (state) => {
      state.selectedCriteriaDetail = initialState.selectedCriteriaDetail;
    },
    updateExpression: (state, { payload }) => {
      if (state.selectedCriteriaDetail)
        state.selectedCriteriaDetail.custom_expression = payload;
    },
    setSelectedTemplate: (state, { payload }) => {
      state.selectedTemplate = payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFundsForCriteria.fulfilled, (state, { payload }) => {
      state.funds = payload;
    });
    builder.addCase(fetchGeoSelector.fulfilled, (state, { payload }) => {
      state.geoSelector = payload;
    });
    builder.addCase(fetchFundsTags.fulfilled, (state, { payload }) => {
      state.fundTags = payload;
    });
    builder.addCase(
      getFundEligibilityCriteria.fulfilled,
      (state, { payload }) => {
        state.fundEligibilityCriteria = payload;
        state.fetchingEligibilityCriteria = false;
      }
    );
    builder.addCase(getFundEligibilityCriteria.pending, (state) => {
      state.fetchingEligibilityCriteria = true;
    });
    builder.addCase(fetchBlockCategories.fulfilled, (state, { payload }) => {
      state.blockCategories = payload;
    });
    builder.addCase(getFundCriteriaDetail.fulfilled, (state, { payload }) => {
      state.selectedCriteriaDetail = payload;
    });
    builder.addCase(fetchSmartBlockTemplates.fulfilled, (state, { payload }) => {
      state.templates = payload;
    });
  },
});

export const {
  setSelectedFund,
  setSelectedCriteria,
  updateCriteriaBlockPayload,
  deleteCriteriaBlockOption,
  updateAdminAnswer,
  updateExpression,
  clearCriteriaDetail,
  setSelectedTemplate,
} = eligibilityCriteriaSlice.actions;

export default eligibilityCriteriaSlice.reducer;
