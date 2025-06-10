import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

export const fetchFundProfile = createAsyncThunk(
  "indicationOfInterest/fetchFundProfile",
  async (external_id: string, thunkAPI) => {
    try {
      return await API.getFundProfile(external_id);
    } catch (error) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
