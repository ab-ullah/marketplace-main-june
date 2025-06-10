import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchInvestor = createAsyncThunk(
  "investorOwnership/fetchInvestor", async (dateParams:string, thunkAPI) => {
    try {
      return await API.getInvestorDetail(dateParams);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchInvestorCurrencies = createAsyncThunk(
  "investorOwnership/fetchInvestorCurrencies", async (_, thunkAPI) => {
    try {
      return await API.getInvestorCurrencies();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchNotifications = createAsyncThunk(
  "investorOwnership/fetchNotifications", async (qs: string | null, thunkAPI) => {
    try {
      return await API.getNotifications(qs);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchNotificationFilters = createAsyncThunk(
  "investorOwnership/fetchNotificationFilters", async (qs: string | null, thunkAPI) => {
    try {
      return await API.getNotificationFilters(qs);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchNotificationsNextPage = createAsyncThunk(
  "investorOwnership/fetchNotificationsNextPage", async (url:string|null, thunkAPI) => {
    try {
      return await API.getNotificationsPage(url);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });
