import {createSlice} from '@reduxjs/toolkit';
import {getCapitalCall} from "./thunks";
import {ICapitalCall} from "../../interfaces/capitalCall";

export interface CapitalCallState {
  capitalCall: ICapitalCall | null;
}

const initialState: CapitalCallState = {
  capitalCall: null
};

export const capitalCallSlice = createSlice({
  name: 'capitalCallSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getCapitalCall.fulfilled, (state, {payload}) => {
        state.capitalCall = payload;
      }
    );
  }
});


export default capitalCallSlice.reducer;