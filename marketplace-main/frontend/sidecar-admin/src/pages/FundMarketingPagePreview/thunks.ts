import {createAsyncThunk} from "@reduxjs/toolkit";
import FundMarketingPageAPI from "../../api/fundMarketingPageAPI/marketing_page_api";

// TODO: Consider using RTK Query


export const fetchPreviewFundPageDetail = createAsyncThunk(
  "fundMarketingPagePreview/fetchPreviewFundPageDetail", async (pageId: number, thunkAPI) => {
    try {
      return await FundMarketingPageAPI.getFundMarketingPageDetail(pageId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });
