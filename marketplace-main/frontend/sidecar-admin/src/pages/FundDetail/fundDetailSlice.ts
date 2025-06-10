import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchFund, fetchFundDetail} from "./thunks";
import {IFundBaseInfo, IFundDetail} from "../../interfaces/fundDetails";
import {IFund} from "../Funds/interfaces";

export interface FundInvestorState {
  fund: IFund | null;
  fundDetail: IFundDetail | null;
}

const initialState: FundInvestorState = {
  fund: null,
  fundDetail: null
};

export const fundDetailSlice = createSlice({
  name: 'fundDetailSlice',
  initialState,
  reducers: {
    setFund: (state, action: PayloadAction<IFund | null>) => {
      state.fund = action.payload;
    },
    clearFund: (state) => {
      state.fund = initialState.fund;
    },
    clearFundDetail: (state) => {
      state.fundDetail = initialState.fundDetail;
    },
    editFund: (state, action: PayloadAction<any>) => {
      if (state.fund) state.fund = {...state.fund, ...action.payload};
    },
    editFundDetail: (state, action: PayloadAction<any>) => {
      if (state.fundDetail) state.fundDetail = {...state.fundDetail, ...action.payload};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFund.fulfilled, (state, {payload}) => {
        state.fund = payload;
      }
    );
    builder.addCase(
      fetchFundDetail.fulfilled, (state, {payload}) => {
        state.fundDetail = payload;
      }
    );
  }
});

export const {setFund, clearFund, clearFundDetail, editFund, editFundDetail} = fundDetailSlice.actions;


export default fundDetailSlice.reducer;