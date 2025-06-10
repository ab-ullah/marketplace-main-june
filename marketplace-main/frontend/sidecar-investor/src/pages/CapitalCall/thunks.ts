import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const getCapitalCall = createAsyncThunk(
  "capitalCall/capitalCallDetail", async (uuid: string, thunkAPI) => {
    try {
      return await API.getCapitalCallDetails(uuid);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });