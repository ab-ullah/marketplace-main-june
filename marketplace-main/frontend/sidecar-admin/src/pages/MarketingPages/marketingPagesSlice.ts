import {createSlice} from '@reduxjs/toolkit';
import {fetchMarketingPages} from "./thunks";
import {IMarketingPage} from "../../interfaces/FundMarketingPage/fundMarketingPage";


export interface MarketingPagesState {
  marketingPages: IMarketingPage[];
  isFetching: boolean;
}

const initialState: MarketingPagesState = {
  marketingPages: [],
  isFetching: false
};

export const marketingPagesSlice = createSlice({
  name: 'marketingPagesSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchMarketingPages.fulfilled, (state, {payload}) => {
        state.marketingPages = payload;
        state.isFetching = false;
      }
    );
    builder.addCase(
      fetchMarketingPages.pending, (state) => {
        state.isFetching = true;
      },
    );
  }
});


export default marketingPagesSlice.reducer;