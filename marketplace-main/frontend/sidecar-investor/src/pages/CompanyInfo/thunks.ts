import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const getCompanyProfile = createAsyncThunk(
  "companyInfo/getCompanyProfile", async (companySlug: string, thunkAPI) => {
    try {
      return await API.getCompanyProfile(companySlug);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });