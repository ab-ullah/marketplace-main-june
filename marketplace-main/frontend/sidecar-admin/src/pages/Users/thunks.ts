import {createAsyncThunk} from "@reduxjs/toolkit";
import API from "../../api";

// TODO: Consider using RTK Query

export const fetchUsers = createAsyncThunk(
  "users/fetchUser", async (_, thunkAPI) => {
    try {
      return await API.getUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const createUser = createAsyncThunk(
  "users/addUser", async (payload: any, thunkAPI) => {
    try {
      return await API.createUser(payload);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchInvestorProfiles = createAsyncThunk(
  "users/investorProfiles", async (_, thunkAPI) => {
    try {
      return await API.getInvestorProfiles();
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

export const fetchGroups = createAsyncThunk(
    "users/fetchGroups", async (_, thunkAPI) => {
      try {
        return await API.getGroups();
      } catch (error) {
        return thunkAPI.rejectWithValue({error: error.message});
      }
    });