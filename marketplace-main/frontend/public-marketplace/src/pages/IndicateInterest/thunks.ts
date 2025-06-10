import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api/marketplaceApi";

// TODO: Consider using RTK Query

export const fetchFundProfile = createAsyncThunk(
  "indicateInterest/fetchFundProfile", async (externalId: string, thunkAPI) => {
    try {
      return await API.getFundProfile(externalId);
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });