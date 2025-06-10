import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchFundsForCriteria = createAsyncThunk(
  "eligibilityCriteria/fetchFunds",
  async (_, thunkAPI) => {
    try {
      return await API.getFundsForEligibilityCriteria();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchGeoSelector = createAsyncThunk(
  "eligibilityCriteria/fetchGeoSelector",
  async (_, thunkAPI) => {
    try {
      return await API.getRegionCountries();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchFundsTags = createAsyncThunk(
  "eligibilityCriteria/fetchFundsTags",
  async (_, thunkAPI) => {
    try {
      return await API.getFundTags();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const getFundEligibilityCriteria = createAsyncThunk(
  "eligibilityCriteria/getFundEligibilityCriteria",
  async (fundId: number, thunkAPI) => {
    try {
      return await API.getFundEligibilityCriteria(fundId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const getFundCriteriaDetail = createAsyncThunk(
  "eligibilityCriteria/getFundCriteriaDetail",
  async (criteriaId: number, thunkAPI) => {
    try {
      return await API.getFundCriteriaDetail(criteriaId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchBlockCategories = createAsyncThunk(
  "eligibilityCriteria/fetchBlockCategories",
  async (_, thunkAPI) => {
    try {
      return await API.getBlockCategories();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);

export const fetchSmartBlockTemplates = createAsyncThunk(
  "eligibilityCriteria/fetchSmartBlockTemplates",
  async (_, thunkAPI) => {
    try {
      return await API.getSavedTemplates();
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  }
);
