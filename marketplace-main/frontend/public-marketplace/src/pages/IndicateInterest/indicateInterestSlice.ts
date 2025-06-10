import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchFundProfile} from "./thunks";
import {IFundWithProfile} from "../../interfaces/fundProfile";


export interface FundProfileState {
  fund: IFundWithProfile | null;
}

const initialState: FundProfileState = {
  fund: null
};

export const indicateInterestSlice = createSlice({
  name: 'indicateInterestSlice',
  initialState,
  reducers: {
    markIndicateInterest: (state, action: PayloadAction<boolean>) => {
      if (state.fund) {
        state.fund.indicated_interest = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFundProfile.fulfilled, (state, {payload}) => {
        state.fund = payload;
      }
    );
  }
});

export const {markIndicateInterest} = indicateInterestSlice.actions;

export default indicateInterestSlice.reducer;