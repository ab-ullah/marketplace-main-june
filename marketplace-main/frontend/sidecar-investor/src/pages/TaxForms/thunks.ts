import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import API from '../../api';

export const fetchTaxForms = createAsyncThunk<any, string, { state: RootState }>(
  "taxModule/getTaxForms", async (fundExternalId, thunkAPI) => {
    try {
      return await API.getTaxForms(fundExternalId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchTaxDocuments = createAsyncThunk<any, string, { state: RootState }>(
  "taxModule/getTaxDocuments", async (tax_record_id, thunkAPI) => {
    try {
      return await API.getTaxDocumentsList(tax_record_id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchAppRecord = createAsyncThunk<any, string, { state: RootState }>(
  "taxModule/fetchAppRecord", async (externalId, thunkAPI) => {
    try {
      return await API.getAppRecords(externalId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchTaxDocumentsList = createAsyncThunk<any, string, { state: RootState }>(
  "taxModule/fetchTaxDocumentsList", async (tax_record_id, thunkAPI) => {
    try {
      return await API.getTaxDocumentsList(tax_record_id);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ error: error.message });
    }
  });

export const fetchGeoSelector = createAsyncThunk(
  "taxModule/fetchGeoSelector", async (externalId: string, thunkAPI) => {
    try {
      return await API.getRegionCountries(externalId);
    } catch (error: any) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const updateTaxRecord = createAsyncThunk(
    "taxModule/updateTaxRecord", async (payload: any, thunkAPI) => {
      try {
        return await API.updateTaxRecord(payload.recordUUID,payload.values);
      } catch (error: any) {
        return thunkAPI.rejectWithValue({error: error.message});
      }
    });

export const fetchTaxDetails = createAsyncThunk(
      "taxModule/fetchTaxDetails", async (record_id: string, thunkAPI) => {
        try {
          return await API.fetchTaxDetails(record_id);
        } catch (error: any) {
          return thunkAPI.rejectWithValue({error: error.message});
        }
      });

export const createTaxWorkflow = createAsyncThunk(
        "taxModule/createTaxWorkflow", async (external_id: any, thunkAPI) => {
          try {
            return await API.createTaxWorkflow(external_id);
          } catch (error: any) {
            return thunkAPI.rejectWithValue({error: error.message});
          }
        });
  

