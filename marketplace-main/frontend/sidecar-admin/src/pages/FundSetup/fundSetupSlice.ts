import {createSlice} from '@reduxjs/toolkit';
import {initFilter} from './constants';
import {IApplicantManagementRow, IApplicantStatuses} from "./interfaces";
import {fetchApplicantManagementList, fetchApplicationStatuses, fetchVehicles} from "./thunks";


export interface FundSetupState {
  applicants: IApplicantManagementRow[],
  vehicles: any;
  filter: typeof initFilter;
  applicant_status: IApplicantStatuses;
}

const initialState: FundSetupState = {
  applicants: [],
  vehicles: [],
  filter: initFilter,
  applicant_status: {},
};

export const fundSetupSlice = createSlice({
  name: 'fundSetupSlice',
  initialState,
  reducers: {
    resetToDefault: (state) => {
      const current_filter = state.filter;
      return {
        ...initialState,
        filter: current_filter
      }
    },
    resetFundSetup: (state) => {
      return {
        ...initialState
      }
    },
    setFilters: (state, action: any) => {
      state.filter = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchApplicantManagementList.fulfilled, (state, {payload}) => {
        state.applicants = payload;
      }
    );
    builder.addCase(
      fetchApplicationStatuses.fulfilled, (state, {payload}) => {
        state.applicant_status = payload;
      }
    );
    builder.addCase(
      fetchVehicles.fulfilled, (state, {payload}) => {
        state.vehicles = payload;
      }
    );
  }
});

export const {resetToDefault, resetFundSetup, setFilters} = fundSetupSlice.actions;
export default fundSetupSlice.reducer;