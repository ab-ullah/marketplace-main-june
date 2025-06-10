import {createAsyncThunk} from "@reduxjs/toolkit";
import FundMarketingAPI from "../../api/fundMarketingPageAPI/marketing_page_api";

// TODO: Consider using RTK Query

export const fetchMarketingPages = createAsyncThunk(
  "fundMarketingPages/fetchMarketingPages", async (fundId: number, thunkAPI) => {
    try {
      return await FundMarketingAPI.getFundMarketingPages(fundId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

