import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchFund = createAsyncThunk(
  "requestAllocation/fetchFund", async (externalId: string, thunkAPI) => {
    try {
      return await API.getFundDemand(externalId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });