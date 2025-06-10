import {createSlice} from '@reduxjs/toolkit';
import {fetchFundProfile} from "./thunks";
import {IFundWithProfile} from "../../interfaces/fundProfile";

export interface FundProfileState {
  fund: IFundWithProfile | null;
}

const initialState: FundProfileState = {
  fund: null
};

export const fundProfileSlice = createSlice({
  name: 'fundProfileSlice',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchFundProfile.fulfilled, (state, {payload}) => {
        state.fund = payload;
      }
    );
  }
});



export default fundProfileSlice.reducer;