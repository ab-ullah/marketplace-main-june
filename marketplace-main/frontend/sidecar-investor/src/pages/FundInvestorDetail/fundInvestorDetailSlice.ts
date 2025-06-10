import {createSlice} from '@reduxjs/toolkit';
import {fetchFundInvestorDetail, fetchInvestorProfiles} from "./thunks";
import {IFundInvestorDetail, IInvestorProfile} from "../../interfaces/fundInvestorDetail";

export interface FundInvestorDetailState {
  fundInvestments: IFundInvestorDetail[];
  investorProfiles: IInvestorProfile[];
}

const initialState: FundInvestorDetailState = {
  fundInvestments: [],
  investorProfiles: []
};

export const fundInvestorDetailSlice = createSlice({
  name: 'fundInvestorDetailSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchFundInvestorDetail.fulfilled, (state, {payload}) => {
        state.fundInvestments = payload;
      }
    );
    builder.addCase(
      fetchInvestorProfiles.fulfilled, (state, {payload}) => {
        state.investorProfiles = payload;
      }
    );
  }
});


export default fundInvestorDetailSlice.reducer;