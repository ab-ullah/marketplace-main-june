import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchGeoSelector, getFundCriteriaPreview} from "./thunks";
import {GeoSelector} from "../../interfaces/EligibilityCriteria/regionCountries";
import {IApplicantInfo, IEligibilityCriteriaDetail,} from "../../interfaces/EligibilityCriteria/criteria";


export interface EligibilityCriteriaState {
  geoSelector: GeoSelector[];
  fundCriteriaDetail: IEligibilityCriteriaDetail | null;
  previewAnswers: any;
  selectedOption: any;
  logicFlowValues: any;
  userFilesText: any;
  renderedBlockIds: string[],
  applicantInfo: IApplicantInfo;
}

const initialState: EligibilityCriteriaState = {
  geoSelector: [],
  fundCriteriaDetail: null,
  previewAnswers: {},
  selectedOption: null,
  logicFlowValues: {},
  userFilesText: {},
  renderedBlockIds: [],
  applicantInfo: {
    firstName: '',
    lastName: '',
    jobTitle: '',
    department: null,
    jobBand: null,
    entityType: null,
    officeLocation: null,
  }
};

export const eligibilityCriteriaPreviewSlice = createSlice({
  name: 'eligibilityCriteriaSlice',
  initialState,
  reducers: {
    setAnswer: (state, action: PayloadAction<any>) => {
      state.previewAnswers = {...state.previewAnswers, ...action.payload};
    },
    setSelectedOption: (state, action: PayloadAction<any>) => {
      state.selectedOption = {...state.selectedOption, ...action.payload}
    },
    setLogicFlowValues: (state, action: PayloadAction<any>) => {
      state.logicFlowValues = {...state.logicFlowValues, ...action.payload};
    },
    setUserFilesText: (state, action: PayloadAction<any>) => {
      const [text] = Object.values(action.payload)
      if (!Object.values(state.userFilesText).includes(text)) {
        state.userFilesText = {...state.userFilesText, ...action.payload};
      }
    },
    setRenderedBlockIds: (state, action: PayloadAction<any>) => {
      state.renderedBlockIds = action.payload;
    },
    resetUserFilesText: (state, action: PayloadAction<any>) => {
      const userFilesText = state.userFilesText;
      Object.keys(state.userFilesText).forEach((key) => key.includes(action.payload) && delete userFilesText[key])
      state.userFilesText = userFilesText;
    },
    updateApplicantInfo: (state, action: PayloadAction<any>) => {
      state.applicantInfo = {...state.applicantInfo, ...action.payload};
    },
    resetToDefault: () => initialState
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchGeoSelector.fulfilled, (state, {payload}) => {
        state.geoSelector = payload;
      }
    );
    builder.addCase(
      getFundCriteriaPreview.fulfilled, (state, {payload}) => {
        state.fundCriteriaDetail = payload;
      }
    );
  }
});

export const {
  setAnswer,
  setSelectedOption,
  setLogicFlowValues,
  setUserFilesText,
  setRenderedBlockIds,
  resetUserFilesText,
  updateApplicantInfo,
  resetToDefault
} = eligibilityCriteriaPreviewSlice.actions;


export default eligibilityCriteriaPreviewSlice.reducer;