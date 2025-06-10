import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../app/store';
import {IFund} from "./interfaces";

export interface FundState {
  funds: IFund[];
}

const initialState: FundState = {
  funds: []
};

export const fundsSlice = createSlice({
  name: 'fundsSlice',
  initialState,
  reducers: {
    setFunds: (state, action: PayloadAction<IFund[]>) => {
      state.funds = action.payload;
    },
    addFund: (state, action: PayloadAction<IFund>) => {
      state.funds = [...state.funds, action.payload];
    },
    editFund: (state, action: PayloadAction<IFund>) => {
      state.funds = state.funds.map((fund) => {
        if (fund.id === action.payload.id) return action.payload
        return fund
      });
    },
    deleteFund: (state, action: PayloadAction<number>) => {
      state.funds = [...state.funds.filter(fund => fund.id !== action.payload)]
    }
  },
});

export const {setFunds, addFund, deleteFund, editFund} = fundsSlice.actions;

export default fundsSlice.reducer;