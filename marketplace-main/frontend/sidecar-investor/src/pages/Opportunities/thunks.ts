import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchOpportunities = createAsyncThunk(
  "opportunities/fetchOpportunities", async (companySlug: string, thunkAPI) => {
    try {
      return await API.getOpportunities(companySlug);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });