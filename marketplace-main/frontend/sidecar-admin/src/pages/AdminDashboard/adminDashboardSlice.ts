import {createSlice} from '@reduxjs/toolkit';
import {getAdminStats} from "./thunks";
import {IAdminStats} from "../../interfaces/adminDashboard";

export interface AdminDashboardState {
  adminStats: IAdminStats | null;
}

const initialState: AdminDashboardState = {
  adminStats: null
};

export const adminDashboardSlice = createSlice({
  name: 'adminDashboardSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getAdminStats.fulfilled, (state, {payload}) => {
        state.adminStats = payload;
      }
    );
  }
});


export default adminDashboardSlice.reducer;