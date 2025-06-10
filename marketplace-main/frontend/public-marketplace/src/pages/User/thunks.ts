import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api/marketplaceApi";

// TODO: Consider using RTK Query

export const fetchUserInfo = createAsyncThunk(
  "userInfo/fetchUserInfo", async (_, thunkAPI) => {
    try {
      return await API.getUserInfo();
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchUnreadNotificationCount = createAsyncThunk(
  "userInfo/fetchUnreadNotificationCount", async (_, thunkAPI) => {
    try {
      // const data = await API.getUnreadNotificationCount();
      // return data.unread_notification_count;
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchInvestorCompanyUsers = createAsyncThunk(
  "userInfo/fetchInvestorCompanyUsers", async (_, thunkAPI) => {
    try {
      return []
    } catch (error) {
      // @ts-ignore
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

  export const fetchAdvisorCompanyUsers = createAsyncThunk(
    "userInfo/fetchAdvisorCompanyUsers", async (_, thunkAPI) => {
      try {
        return await API.getAdvisorUsers();
      } catch (error) {
         // @ts-ignore
        return thunkAPI.rejectWithValue({error: error.message});
      }
    });

    export const setAdvisorId = createAsyncThunk(
      "userInfo/setAdvisorId", async (payload:string, thunkAPI) => {
        try {
          return payload;
        } catch (error) {
           // @ts-ignore
          return thunkAPI.rejectWithValue({error: error.message});
        }
      });