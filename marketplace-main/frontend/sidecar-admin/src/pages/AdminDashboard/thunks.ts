import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const getAdminStats = createAsyncThunk(
  "adminDashboard/adminStats", async (_, thunkAPI) => {
    try {
      return await API.getAdminStats();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });