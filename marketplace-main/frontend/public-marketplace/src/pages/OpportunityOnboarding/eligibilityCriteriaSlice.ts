import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  fetchGeoSelector,
  getFundCriteriaResponse,
  getFundCriteriaResponseDocuments,
  getFundCriteriaResponseStatus,
  fetchDataProtectionPolicyDocument,
  getEligibilityCriteriaResponse
} from "./thunks";
import {GeoSelector} from "../../interfaces/EligibilityCriteria/regionCountries";
import {IEligibilityCriteriaDetail,} from "../../interfaces/EligibilityCriteria/criteria";
import {
  IEligibilityCriteriaResponse,
  IInvestmentAmount,
  IResponseBlock
} from "../../interfaces/EligibilityCriteria/criteriaResponse";
import {IRequiredDocument} from "../../interfaces/EligibilityCriteria/documents_required";
import {IApplicantInfo, ISelectOption} from "./interfaces";
import { Application } from '../../interfaces/application';


export interface EligibilityCriteriaState {
  geoSelector: GeoSelector[];
  fundCriteriaDetail: IEligibilityCriteriaDetail | null;
  fundCriteriaResponse: IEligibilityCriteriaResponse | null;
  fundApplicationDetails: Application | null;
  requiredDocuments: IRequiredDocument[]
  downloadedDocuments: any;
  isEligible: boolean;
  isLoading: boolean;
  selectedCountry: null | ISelectOption;
  selectedVehicle: null | string;
  error: null | string;
  applicantInfo: IApplicantInfo;
  dataProtectionPolicy: any;
}

export const initApplicantInfo = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  department: null,
  jobBand: null,
  entityType: null,
  officeLocation: null,
  whereWereYouWhenYouDecidedToInvest: null,
};

const initialState: EligibilityCriteriaState = {
  geoSelector: [],
  fundCriteriaDetail: null,
  fundCriteriaResponse: null,
  fundApplicationDetails: null,
  requiredDocuments: [],
  downloadedDocuments: {},
  isEligible: false,
  selectedCountry: null,
  selectedVehicle: null,
  error: null,
  isLoading: false,
  applicantInfo: initApplicantInfo,
  dataProtectionPolicy: [],
};

export const eligibilityCriteriaSlice = createSlice({
  name: 'eligibilityCriteriaSlice',
  initialState,
  reducers: {
    setDownloadedDocument: (state, action: PayloadAction<any>) => {
      state.downloadedDocuments = {...state.downloadedDocuments, ...action.payload};
    },
    setInvestmentAmount: (state, action: PayloadAction<IInvestmentAmount>) => {
      if (state.fundCriteriaResponse) state.fundCriteriaResponse.investment_amount = action.payload;
    },
    setSelectedCountry: (state, action: PayloadAction<ISelectOption>) => {
      state.selectedCountry = action.payload;
    },
    setSelectedVehicleType: (state, action: PayloadAction<string>) => {
      state.selectedVehicle = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateApplicantInfo: (state, action: PayloadAction<any>) => {
      state.applicantInfo = {...state.applicantInfo, ...action.payload};
    },
    updateResponseBlock: (state, action: PayloadAction<IResponseBlock>) => {
      if (state.fundCriteriaResponse) {
        let responseBlocks = state.fundCriteriaResponse.user_block_responses
        if (state.fundCriteriaResponse.user_block_responses.find(responseBlock => responseBlock.block_id === action.payload.block_id)) {
          responseBlocks = state.fundCriteriaResponse.user_block_responses.map((responseBlock) => {
            if (responseBlock.block_id === action.payload.block_id) return action.payload;
            return responseBlock
          })
        } else {
          responseBlocks = [...responseBlocks, action.payload]
        }
        state.fundCriteriaResponse = {...state.fundCriteriaResponse, user_block_responses: responseBlocks}
      }
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
      getFundCriteriaResponse.fulfilled, (state, {payload}) => {
        if (payload.error) {
          state.fundCriteriaDetail = null;
          state.fundCriteriaResponse = null;
          state.error = payload.error;
        } else {
          state.fundCriteriaDetail = payload.criteria_preview;
          state.fundCriteriaResponse = payload.user_response;
          state.fundApplicationDetails = payload.application;
          state.error = null;
        }
      }
    );
    builder.addCase(
      getEligibilityCriteriaResponse.fulfilled, (state, {payload}) => {
        if (payload.error) {
          state.fundCriteriaDetail = null;
          state.fundCriteriaResponse = null;
          state.error = payload.error;
        } else {
          state.fundCriteriaDetail = payload.criteria_preview;
          state.fundCriteriaResponse = payload.user_response;
          state.fundApplicationDetails = payload.application;
          state.error = null;
        }
      }
    );
    builder.addCase(
      getFundCriteriaResponseDocuments.fulfilled, (state, {payload}) => {
        state.requiredDocuments = payload;
      }
    );
    builder.addCase(
      getFundCriteriaResponseStatus.fulfilled, (state, {payload}) => {
        state.isEligible = payload.is_eligible;
      }
    );
    builder.addCase(
      fetchDataProtectionPolicyDocument.fulfilled, (state, {payload}) => {
        state.dataProtectionPolicy = payload;
      }
    );
  }
});

export const {
  setDownloadedDocument,
  updateResponseBlock,
  setSelectedCountry,
  setSelectedVehicleType,
  updateApplicantInfo,
  setInvestmentAmount,
  resetError,
  setIsLoading,
  resetToDefault
} = eligibilityCriteriaSlice.actions;

export default eligibilityCriteriaSlice.reducer;