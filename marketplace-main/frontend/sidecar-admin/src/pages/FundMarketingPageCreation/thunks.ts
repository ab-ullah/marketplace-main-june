import {createAsyncThunk} from "@reduxjs/toolkit";
import FundMarketingPageAPI from "../../api/fundMarketingPageAPI/marketing_page_api";

// TODO: Consider using RTK Query


export const fetchFundPageDetail = createAsyncThunk(
  "fundMarketingPageCreation/fetchPageDetails", async (pageId: number, thunkAPI) => {
    try {
      return await FundMarketingPageAPI.getFundMarketingPageDetail(pageId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchIcons = createAsyncThunk(
  "fundMarketingPageCreation/fetchIcons", async (_, thunkAPI) => {
    try {
      return await FundMarketingPageAPI.getIcons();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });
