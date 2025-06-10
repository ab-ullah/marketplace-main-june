import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IInvestorOwnership} from "../../interfaces/investorOwnership";
import {INotice} from "../../interfaces/notices";
import { fetchFirmNotices, fetchFirmNoticesValuations } from './thunks';


export interface INoticesState {
  firmNotices: INotice[] | null;
  firmNoticesValuations: any | null;
  showUSD: boolean;
}

const initialState: INoticesState = {
  firmNotices: [],
  firmNoticesValuations:[],
  showUSD: true,
};

export const noticesSlice = createSlice({
  name: 'noticesSlice',
  initialState,
  reducers: {
    setShowUSD: (state, action: PayloadAction<boolean>) => {
      state.showUSD = action.payload;
    },
    resetFirmNotices: (state) => {
      state.firmNotices = null;
    },
    resetFirmNoticesValuations: (state) => {
      state.firmNoticesValuations = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFirmNotices.fulfilled, (state, {payload}) => {
        state.firmNotices = payload;
      }
    );
    builder.addCase(
      fetchFirmNoticesValuations.fulfilled, (state, {payload}) => {
        state.firmNoticesValuations = payload;
      }
    );
  }
});

export const {
  setShowUSD,
  resetFirmNotices,
  resetFirmNoticesValuations
} = noticesSlice.actions;


export default noticesSlice.reducer;