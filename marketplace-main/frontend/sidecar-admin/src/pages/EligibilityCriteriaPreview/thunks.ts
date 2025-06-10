import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query


export const fetchGeoSelector = createAsyncThunk(
  "eligibilityCriteriaPreview/fetchGeoSelector", async (_, thunkAPI) => {
    try {
      return await API.getRegionCountries();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const getFundCriteriaPreview = createAsyncThunk(
  "eligibilityCriteriaPreview/getFundCriteriaPreview", async (criteriaId: number, thunkAPI) => {
    try {
      return await API.getFundCriteriaPreview(criteriaId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });
