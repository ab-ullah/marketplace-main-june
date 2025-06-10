import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchFundInvestorDetail = createAsyncThunk(
  "fundInvestor/investorDetail", async (payload:{externalId: string, dateParams:string}, thunkAPI) => {
    try {
      return await API.getFundInvestments(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchInvestorProfiles = createAsyncThunk(
  "fundInvestor/investorProfiles", async (_, thunkAPI) => {
    try {
      return await API.getInvestorProfiles();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });