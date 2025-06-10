import {createAsyncThunk} from "@reduxjs/toolkit";
import applicationsAPI from "../../api/applicationsAPI";

// TODO: Consider using RTK Query

export const fetchApplicantManagementList = createAsyncThunk(
  "FundSetup/fetchApplicantManagementList", async (externalId: string, thunkAPI) => {
    try {
      return await applicationsAPI.getApplicationManagementList(externalId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

  export const fetchVehicles = createAsyncThunk(
    "FundSetup/fetchVehicles", async (_, thunkAPI) => {
      try {
        return await applicationsAPI.fetchVehicles();
      } catch (error) {
        return thunkAPI.rejectWithValue({error: error.message});
      }
    });

export const fetchApplicationStatuses = createAsyncThunk(
      "FundSetup/fetchApplicationStatuses", async (externalId: string, thunkAPI) => {
        try {
          return await applicationsAPI.fetchApplicationStatuses(externalId);
        } catch (error) {
          return thunkAPI.rejectWithValue({error: error.message});
        }
      });