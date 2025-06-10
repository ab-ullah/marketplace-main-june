import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

export const fetchFirmNotices = createAsyncThunk(
  "notices/fetchFirmNotices", async (payload: {firmId: string, startDate?: Date | null, endDate?: Date | null}, thunkAPI) => {
    try {
      const firmId = payload.firmId
      const startDate = payload?.startDate ? payload?.startDate : new Date(1990, 10, 10)
      const endDate = payload?.endDate ? payload?.endDate : new Date()
      return await API.getFirmNotices(firmId, startDate, endDate);
    } catch (error:any) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
});

export const fetchFirmNoticesValuations = createAsyncThunk(
  "notices/fetchFirmNoticesValuations", async (payload: {firmId: string, startDate?: Date | null, endDate?: Date | null}, thunkAPI) => {
    try {
      const firmId = payload.firmId
      return await API.getFirmNoticesValuations(firmId, payload?.startDate, payload?.endDate);
    } catch (error:any) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
});