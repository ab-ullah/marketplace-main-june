import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchTaskCount, fetchTaskFilters, fetchTasks, fetchTasksNextPage} from "./thunks";
import {ITask} from "../../interfaces/Workflow/task";
import {ISelectOptionNumValue} from "../../interfaces/form";
import _ from "lodash";


export interface TaskFilter {
  fund_options: ISelectOptionNumValue[],
  status_options: ISelectOptionNumValue[],
  module_options: ISelectOptionNumValue[],
}

export interface TaskInfo {
  tasks: ITask[];
  next: string | null
}


export interface MarketingPagesState {
  filters: TaskFilter;
  tasksInfo: TaskInfo;
  taskCount: number
}

const initialState: MarketingPagesState = {
  tasksInfo: {
    tasks: [],
    next: null,
  },
  taskCount: 0,
  filters: {
    fund_options: [],
    status_options: [],
    module_options: [],
  }
};


export const tasksSlice = createSlice({
  name: 'tasksSlice',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<ITask>) => {
      if (!state.tasksInfo.tasks.find(task => task.id === action.payload.id)) state.tasksInfo.tasks = [action.payload, ...state.tasksInfo.tasks];
      else state.tasksInfo.tasks = state.tasksInfo.tasks.map(task => task.id === action.payload.id ? action.payload : task)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchTasks.fulfilled, (state, {payload}) => {
          state.tasksInfo = {next: payload.links.next, tasks: payload.results};
          state.tasksInfo.tasks =  _.orderBy(state.tasksInfo.tasks, [(item) => item.belongs_to_me], ['desc']);
      }
    );
    builder.addCase(
      fetchTaskCount.fulfilled, (state, {payload}) => {
        state.taskCount = payload
      }
    );
    builder.addCase(
        fetchTasksNextPage.fulfilled, (state, {payload}) => {
          state.tasksInfo = {next: payload.links.next, tasks: [...state.tasksInfo.tasks, ...payload.results]};
          state.tasksInfo.tasks =  _.orderBy(state.tasksInfo.tasks, [(item) => item.belongs_to_me], ['desc']);
        }
    );
    builder.addCase(
        fetchTaskFilters.fulfilled, (state, {payload}) => {
          state.filters = payload;
        }
    );
  }
});

export const {addTask, } = tasksSlice.actions;

export default tasksSlice.reducer;