import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import {IGroup, IUser} from "./interfaces";
import {createUser, fetchGroups, fetchInvestorProfiles, fetchUsers} from "./thunks";
import {IInvestorProfile} from "../../interfaces/userInterfaces";

export interface UserState {
  users: IUser[];
  investorProfiles: IInvestorProfile[];
  groups: IGroup[]
}

const initialState: UserState = {
  users: [],
  investorProfiles: [],
  groups: [],
};

export const usersSlice = createSlice({
  name: 'usersSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchUsers.fulfilled, (state, {payload}) => {
        state.users = payload;
      }
    );

    builder.addCase(
      createUser.fulfilled, (state, {payload}) => {
        state.users = [...state.users, payload];
      }
    );
    builder.addCase(
      fetchInvestorProfiles.fulfilled, (state, {payload}) => {
        state.investorProfiles = payload;
      }
    );
    builder.addCase(
      fetchGroups.fulfilled, (state, {payload}) => {
        state.groups = payload;
      }
    );
  }
});


export const selectFunds = (state: RootState) => state.fundsState.funds;


export default usersSlice.reducer;