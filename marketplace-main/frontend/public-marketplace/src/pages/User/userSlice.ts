import {createSlice} from '@reduxjs/toolkit';
import {fetchAdvisorCompanyUsers, fetchInvestorCompanyUsers, fetchUnreadNotificationCount, fetchUserInfo, setAdvisorId} from "./thunks";
import {UserInfo} from "../../interfaces/userInfo";
import {IAdvisorUser, ICompanyUser} from "../../interfaces/companyUser";


export interface UserState {
  userInfo: UserInfo | null;
  unreadNotificationCount: number | null;
  companyUsers: ICompanyUser[] | null;
  advisorUsers: IAdvisorUser[] | null
  advisorId: string
}

const initialState: UserState = {
  userInfo: null,
  unreadNotificationCount: null,
  companyUsers: null,
  advisorUsers: null,
  advisorId: ""
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
        state.unreadNotificationCount = 0;
      }
    );
    builder.addCase(
      fetchInvestorCompanyUsers.fulfilled, (state, {payload}) => {
        state.companyUsers = payload;
      }
    );
    builder.addCase(
      fetchAdvisorCompanyUsers.fulfilled, (state, {payload}) => {
        state.advisorUsers = payload;
      }
    );

    builder.addCase(
      setAdvisorId.fulfilled, (state, {payload}) => {
        state.advisorId = payload;
      }
    );
  }
});


export default userSlice.reducer;