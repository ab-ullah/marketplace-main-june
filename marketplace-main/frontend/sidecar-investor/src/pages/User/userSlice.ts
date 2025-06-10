import {createSlice} from '@reduxjs/toolkit';
import {
  fetchAdvisorCompanyUsers,
  fetchConsiderationInvestorCompanyUsers,
  fetchInvestorCompanyUsers,
  fetchUnreadNotificationCount,
  fetchUserInfo
} from "./thunks";
import {UserInfo} from "../../interfaces/userInfo";
import {IAdvisorUser, ICompanyUser} from "../../interfaces/companyUser";


export interface UserState {
  userInfo: UserInfo | null;
  unreadNotificationCount: number | null;
  companyUsers: ICompanyUser[] | null;
  considerationCompanyUsers: ICompanyUser[] | null;
  advisorUsers: IAdvisorUser[] | null
}

const initialState: UserState = {
  userInfo: null,
  unreadNotificationCount: null,
  companyUsers: null,
  considerationCompanyUsers: null,
  advisorUsers: null,
};

export const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      fetchUserInfo.fulfilled, (state, {payload}) => {
        state.userInfo = payload;
      }
    );
    builder.addCase(
      fetchUnreadNotificationCount.fulfilled, (state, {payload}) => {
        state.unreadNotificationCount = payload;
      }
    );
    builder.addCase(
      fetchInvestorCompanyUsers.fulfilled, (state, {payload}) => {
        state.companyUsers = payload;
      }
    );
    builder.addCase(
      fetchConsiderationInvestorCompanyUsers.fulfilled, (state, {payload}) => {
        state.considerationCompanyUsers = payload;
      }
    );
    builder.addCase(
      fetchAdvisorCompanyUsers.fulfilled, (state, {payload}) => {
        state.advisorUsers = payload;
      }
    );
  }
});


export default userSlice.reducer;