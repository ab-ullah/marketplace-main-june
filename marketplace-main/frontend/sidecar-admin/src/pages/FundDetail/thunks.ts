import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchFund = createAsyncThunk(
  "fundDetail/fetchFund", async (externalId: string, thunkAPI) => {
    try {
      return await API.getFundBaseInfo(externalId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchFundDetail = createAsyncThunk(
  "fundDetail/fetchFundDetail", async (externalId: string, thunkAPI) => {
    try {
      return await API.getFundDetail(externalId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });