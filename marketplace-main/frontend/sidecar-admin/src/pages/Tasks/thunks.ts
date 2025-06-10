import {createAsyncThunk} from "@reduxjs/toolkit";
import workflowAPI from "../../api/workflowAPI";

// TODO: Consider using RTK Query

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks", async (qs: string | null, thunkAPI) => {
      console.log(qs)
    try {
      return await workflowAPI.getTasks(qs);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchTaskFilters = createAsyncThunk(
    "tasks/fetchTaskFilters", async (_, thunkAPI) => {
        try {
            return await workflowAPI.getTaskFilters();
        } catch (error) {
            return thunkAPI.rejectWithValue({error: error.message});
        }
    });


export const fetchTasksNextPage = createAsyncThunk(
    "tasks/fetchTasksNextPage", async (url:string|null, thunkAPI) => {
        try {
            return await workflowAPI.getTasksNextPage(url);
        } catch (error) {
            return thunkAPI.rejectWithValue({error: error.message});
        }
    });

export const fetchTaskCount = createAsyncThunk(
  "tasks/fetchTaskCount", async (_, thunkAPI) => {
    try {
      const data = await workflowAPI.getTasksCount();
      return data.count
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });
