import {createSlice} from '@reduxjs/toolkit';
import {fetchPreviewFundPageDetail} from "./thunks";
import {IFundMarketingPageDetail} from "../../interfaces/FundMarketingPage/fundMarketingPage";


export interface FundMarketingPageState {
  previewFundPage: IFundMarketingPageDetail | null;
}

const initialState: FundMarketingPageState = {
  previewFundPage: null,
};

export const previewFundMarketingPageSlice = createSlice({
  name: 'previewFundMarketingPageSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchPreviewFundPageDetail.fulfilled, (state, {payload}) => {
        state.previewFundPage = payload;
      }
    );
  }
});


export default previewFundMarketingPageSlice.reducer;