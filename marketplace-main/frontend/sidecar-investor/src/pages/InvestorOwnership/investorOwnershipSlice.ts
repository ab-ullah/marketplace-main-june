import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  fetchInvestor,
  fetchInvestorCurrencies,
  fetchNotificationFilters,
  fetchNotifications,
  fetchNotificationsNextPage
} from "./thunks";
import {IInvestorOwnership, INotification} from "../../interfaces/investorOwnership";
import {ISelectOptionNumValue} from "../../interfaces/form";

export interface NotificationFilter {
  fund_options: ISelectOptionNumValue[],
  type_options: ISelectOptionNumValue[],
  investor_options: ISelectOptionNumValue[],
  has_unread_notification: boolean,
}

export interface NotificationInfo {
  notifications: INotification[];
  next: string | null
}

export interface InvestorOwnershipState {
  investor: IInvestorOwnership | null;
  notificationInfo: NotificationInfo;
  filters: NotificationFilter;
  showUSD: boolean;
  selectedCurrency: string | null;
  investorCurrencies: any;
}

const initialState: InvestorOwnershipState = {
  investor: null,
  notificationInfo: {
    notifications: [],
    next: null,
  },
  filters: {
    fund_options: [],
    type_options: [],
    investor_options: [],
    has_unread_notification: false
  },
  showUSD: true,
  selectedCurrency: null,
  investorCurrencies: {}
};

export const investorOwnershipSlice = createSlice({
  name: 'investorOwnershipSlice',
  initialState,
  reducers: {
    setInvestor: (state, action: PayloadAction<IInvestorOwnership | null>) => {
      state.investor = action.payload;
    },
    setShowUSD: (state, action: PayloadAction<boolean>) => {
      state.showUSD = action.payload;
    },
    resetNotifications: (state, action: PayloadAction<any>) => {
      state.notificationInfo = initialState.notificationInfo
    },
    markNotificationAsRead: (state, action: PayloadAction<number>) => {
      const notifications = state.notificationInfo.notifications.map(notification => {
        if (notification.id === action.payload) return {...notification, is_read: true}
        return notification
      });
      state.notificationInfo = {...state.notificationInfo, notifications}
    },
    setSelectedCurrency: (state, action: PayloadAction<string | null>) => {
      state.selectedCurrency = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchInvestor.fulfilled, (state, {payload}) => {
        state.investor = payload;
      }
    );
    builder.addCase(
      fetchInvestorCurrencies.fulfilled, (state, {payload}) => {
        state.investorCurrencies = payload;
      }
    );
    builder.addCase(
      fetchNotifications.fulfilled, (state, {payload}) => {
        state.notificationInfo = {next: payload.links.next, notifications: payload.results};
      }
    );
    builder.addCase(
      fetchNotificationsNextPage.fulfilled, (state, {payload}) => {
        state.notificationInfo = {next: payload.links.next, notifications: [...state.notificationInfo.notifications, ...payload.results]};
      }
    );
    builder.addCase(
      fetchNotificationFilters.fulfilled, (state, {payload}) => {
        state.filters = payload;
      }
    );
  }
});

export const {
  setInvestor,
  setShowUSD,
  setSelectedCurrency,
  markNotificationAsRead,
  resetNotifications
} = investorOwnershipSlice.actions;


export default investorOwnershipSlice.reducer;