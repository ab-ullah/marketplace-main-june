import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchInvestor, fetchInvestorNoticeDetails, fetchInvestorNoticeValuationDetails} from "./thunks";
import {IInvestorOwnership} from "../../interfaces/investorOwnership";
import {INotice, INoticeResponse} from "../../interfaces/notices";


export interface INoticesState {
  notices: INotice[] | null;
  noticeDetails: INoticeResponse | null;
  noticeValuationDetails: any | null;
  showUSD: boolean;
}

const initialState: INoticesState = {
  notices: null,
  noticeDetails: null,
  noticeValuationDetails: null,
  showUSD: true,
};

export const noticesSlice = createSlice({
  name: 'noticesSlice',
  initialState,
  reducers: {
    setInvestor: (state, action: PayloadAction<INotice[] | null>) => {
      state.notices = action.payload;
    },
    setShowUSD: (state, action: PayloadAction<boolean>) => {
      console.log({show: action.payload})
      state.showUSD = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchInvestor.fulfilled, (state, {payload}) => {
        state.notices = payload;
      }
    );
    builder.addCase(
      fetchInvestorNoticeDetails.fulfilled, (state, {payload}) => {
        state.noticeDetails = payload;
      }
    );
    builder.addCase(
      fetchInvestorNoticeValuationDetails.fulfilled, (state, {payload}) => {
        state.noticeValuationDetails = payload;
      }
    );
  }
});

export const {
  setInvestor,
  setShowUSD,
} = noticesSlice.actions;


export default noticesSlice.reducer;