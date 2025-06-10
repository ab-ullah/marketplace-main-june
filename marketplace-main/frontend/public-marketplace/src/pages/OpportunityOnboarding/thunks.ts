import {createAsyncThunk} from "@reduxjs/toolkit";
import eligibilityCriteriaApi from "../../api/eligibilityCriteria";

// TODO: Consider using RTK Query


export const fetchGeoSelector = createAsyncThunk(
  "eligibilityCriteria/fetchGeoSelector", async (externalId: string, thunkAPI) => {
    try {
      return await eligibilityCriteriaApi.getRegionCountries(externalId);
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const getFundCriteriaResponse = createAsyncThunk(
  "eligibilityCriteria/getFundCriteriaResponse", async (payload: any, thunkAPI) => {
    try {
      return await eligibilityCriteriaApi.getEligibilityCriteriaResponse(
        payload.externalId,
        payload.countryCode,
        payload.vehicleType,
        payload.applicantInfo
      );
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const getFundCriteriaResponseDocuments = createAsyncThunk(
  "eligibilityCriteria/getFundCriteriaResponseDocuments", async (responseId: number, thunkAPI) => {
    try {
      return await eligibilityCriteriaApi.getResponseDocuments(responseId);
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const getFundCriteriaResponseStatus = createAsyncThunk(
  "eligibilityCriteria/getFundCriteriaResponseStatus", async (responseId: number, thunkAPI) => {
    try {
      return await eligibilityCriteriaApi.getResponseStatus(responseId);
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const getEligibilityCriteriaResponse = createAsyncThunk(
  "eligibilityCriteria/getEligibilityCriteriaResponse", async (externalId: string, thunkAPI) => {
    try {
      return await eligibilityCriteriaApi.fetchEligibilityCriteria(externalId);
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

  

export const fetchDataProtectionPolicyDocument = createAsyncThunk(
    "eligibilityCriteria/fetchDataProtectionPolicyDocument", async (externalId: string, thunkAPI) => {
      try {
        return await eligibilityCriteriaApi.fetchDataProtectionPolicyDocument(externalId);
      } catch (error) {
        // @ts-ignore
        return thunkAPI.rejectWithValue({error: error.message});
      }
    });
