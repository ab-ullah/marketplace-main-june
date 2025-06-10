import {createAsyncThunk} from "@reduxjs/toolkit";
import workflowAPI from "../../api/workflowAPI";

// TODO: Consider using RTK Query

export const fetchComments = createAsyncThunk(
  "taskReview/fetchComments", async (workflowId: number, thunkAPI) => {
    try {
      return await workflowAPI.getWorkflowComments(workflowId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });


export const fetchTaskDetail = createAsyncThunk(
  "taskReview/fetchTaskDetail", async (taskId: string | number, thunkAPI) => {
    try {
      return await workflowAPI.getTaskDetail(taskId);
    } catch (error) {
      return thunkAPI.rejectWithValue({error: error.message});
    }
  });

