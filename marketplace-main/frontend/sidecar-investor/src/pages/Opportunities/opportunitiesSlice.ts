import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IOpportunity} from "./interfaces";
import {fetchOpportunities} from "./thunks";

export interface OpportunitiesState {
  opportunities: IOpportunity[];
}

const initialState: OpportunitiesState = {
  opportunities: []
};

export const opportunitiesSlice = createSlice({
  name: 'opportunitiesSlice',
  initialState,
  reducers: {
    setOpportunities: (state, action: PayloadAction<IOpportunity[]>) => {
      state.opportunities = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchOpportunities.fulfilled, (state, {payload}) => {
        state.opportunities = payload;
      }
    );
  }
});

export const {setOpportunities} = opportunitiesSlice.actions;


export default opportunitiesSlice.reducer;