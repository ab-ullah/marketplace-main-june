import {createSlice} from '@reduxjs/toolkit';
import {fetchFundPageDetail, fetchIcons} from "./thunks";
import {IFundMarketingPageDetail} from "../../interfaces/FundMarketingPage/fundMarketingPage";
import {IIcon} from "../../interfaces/FundMarketingPage/icon";


export interface FundMarketingPageState {
  fundMarketingPage: IFundMarketingPageDetail | null;
  icons: IIcon[];
}

const initialState: FundMarketingPageState = {
  fundMarketingPage: null,
  icons: []
};

export const fundMarketingPageSlice = createSlice({
  name: 'fundMarketingPageSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchFundPageDetail.fulfilled, (state, {payload}) => {
        state.fundMarketingPage = payload;
      }
    );
    builder.addCase(
      fetchIcons.fulfilled, (state, {payload}) => {
        state.icons = payload;
      }
    );
  }
});


export default fundMarketingPageSlice.reducer;