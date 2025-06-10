import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchUserInfo = createAsyncThunk(
  "userInfo/fetchUserInfo", async (_, thunkAPI) => {
    try {
      return await API.getUserInfo();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchUnreadNotificationCount = createAsyncThunk(
  "userInfo/fetchUnreadNotificationCount", async (_, thunkAPI) => {
    try {
      const data = await API.getUnreadNotificationCount();
      return data.unread_notification_count;
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchInvestorCompanyUsers = createAsyncThunk(
  "userInfo/fetchInvestorCompanyUsers", async (_, thunkAPI) => {
    try {
      return await API.getInvestorUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchConsiderationInvestorCompanyUsers = createAsyncThunk(
  "userInfo/fetchConsiderationCompanyUsers", async (_, thunkAPI) => {
    try {
      return await API.getConsiderationInvestorUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

  export const fetchAdvisorCompanyUsers = createAsyncThunk(
    "userInfo/fetchAdvisorCompanyUsers", async (_, thunkAPI) => {
      try {
        return await API.getAdvisorUsers();
      } catch (error) {
        return thunkAPI.rejectWithValue({error: error.message});
      }
    });
