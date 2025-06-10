import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchFund} from "./thunks";
import {IFundDetail} from "../../interfaces/fundDetails";

export interface FundDemandState {
  fund: IFundDetail | null;
}

const initialState: FundDemandState = {
  fund: null
};

export const fundDemandSlice = createSlice({
  name: 'fundDemandSlice',
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

export const {setFund} = fundDemandSlice.actions;


export default fundDemandSlice.reducer;