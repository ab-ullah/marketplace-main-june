import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchComments, fetchTaskDetail} from "./thunks";
import {IComment} from "../../interfaces/Workflow/comment";
import {ITaskDetail} from "../../interfaces/Workflow/task";


export interface TaskReviewState {
  comments: IComment[],
  task: ITaskDetail | null
}

const initialState: TaskReviewState = {
  comments: [],
  task: null
};

export const taskReviewSlice = createSlice({
  name: 'taskReviewSlice',
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<IComment>) => {
      state.comments = [...state.comments, action.payload];
    },
    clearComment: (state) => {
      state.comments = initialState.comments;
    },
    resetToDefault: () => initialState
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchComments.fulfilled, (state, {payload}) => {
        state.comments = payload
      }
    );
    builder.addCase(
      fetchTaskDetail.fulfilled, (state, {payload}) => {
        state.task = payload
      }
    );
  }
});

export const {addComment, clearComment, resetToDefault} = taskReviewSlice.actions;

export default taskReviewSlice.reducer;