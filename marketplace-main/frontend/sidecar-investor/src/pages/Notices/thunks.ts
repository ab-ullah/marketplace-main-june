import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";



export const fetchInvestor = createAsyncThunk(
  "notices/fetchInvestor", async (payload: {startDate?: Date | null, endDate?: Date | null} | null, thunkAPI) => {
    try {
      const startDate = payload?.startDate ? payload?.startDate : new Date(1990, 10, 10)
      const endDate = payload?.endDate ? payload?.endDate : new Date()
      return await API.getInvestorNotices(startDate, endDate);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchInvestorNoticeDetails = createAsyncThunk(
  "notices/fetchInvestorNoticeDetails", async (payload: {startDate?: Date | null, endDate?: Date | null} | null, thunkAPI) => {
    try {
      const startDate = payload?.startDate ? payload?.startDate : new Date(1990, 10, 10)
      const endDate = payload?.endDate ? payload?.endDate : new Date()
      return await API.getInvestorNoticesDetails(startDate, endDate);
    } catch (error:any) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

  export const fetchInvestorNoticeValuationDetails = createAsyncThunk(
    "notices/fetchInvestorNoticeValuationDetails", async (payload: {startDate?: Date | null, endDate?: Date | null} | null, thunkAPI) => {
      try {
        return await API.getInvestorNoticesValuationsDetails(payload?.startDate, payload?.endDate);
      } catch (error:any) {
        return thunkAPI.rejectWithValue({error: error.message});
      }
    });

