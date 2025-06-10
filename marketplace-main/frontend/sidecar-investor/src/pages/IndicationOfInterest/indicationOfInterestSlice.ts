import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { IFund, IIndicationOfInterestState } from './interfaces';
import { fetchFundProfile } from './thunks';

const initialState: IIndicationOfInterestState = {
    fundDetails: null
}

export const indicationOfInterestSlice = createSlice({
    name: 'indicationOfInterestSlice',
    initialState,
    reducers: {
      setFundDetails: (state, action: PayloadAction<IFund | null>) => {
        state.fundDetails = action.payload;
      },
    },
    extraReducers: (builder) => {
        builder.addCase(
            fetchFundProfile.fulfilled, (state, {payload}) => {
              state.fundDetails = payload;
            }
          );
    }
  });

export const {setFundDetails} = indicationOfInterestSlice.actions;


export default indicationOfInterestSlice.reducer;