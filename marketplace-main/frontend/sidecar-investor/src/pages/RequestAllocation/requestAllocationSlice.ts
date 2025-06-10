import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {fetchFund} from "./thunks";
import {IFundDetail} from "../../interfaces/fundDetails";

export interface RequestAllocationState {
  fund: IFundDetail | null;
}

const initialState: RequestAllocationState = {
  fund: null
};

export const requestAllocationSlice = createSlice({
  name: 'requestAllocationSlice',
  initialState,
  reducers: {
    setFund: (state, action: PayloadAction<IFundDetail | null>) => {
      state.fund = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFund.fulfilled, (state, {payload}) => {
        state.fund = payload;
      }
    );
  }
});

export const {setFund} = requestAllocationSlice.actions;


export default requestAllocationSlice.reducer;