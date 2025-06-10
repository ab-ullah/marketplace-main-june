import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchFund} from "./thunks";
import {IFundDetail} from "../../interfaces/fundDetails";

export interface FundInvestorState {
  fund: IFundDetail | null;
}

const initialState: FundInvestorState = {
  fund: null
};

export const fundInvestorsSlice = createSlice({
  name: 'fundInvestorsSlice',
  initialState,
  reducers: {
    setFund: (state, action: PayloadAction<IFundDetail | null>) => {
      state.fund = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFund.fulfilled, (state, {payload}) => {
        state.fund = payload;
      }
    );
  }
});

export const {setFund} = fundInvestorsSlice.actions;


export default fundInvestorsSlice.reducer;