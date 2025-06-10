import {createSlice} from '@reduxjs/toolkit';
import {getCompanyProfile} from "./thunks";
import {ICompany} from "../../interfaces/company";

export interface CompanyInfoState {
  company: ICompany | null;
}

const initialState: CompanyInfoState = {
  company: null
};

export const companyInfoSlice = createSlice({
  name: 'companyInfoSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getCompanyProfile.fulfilled, (state, {payload}) => {
        state.company = payload;
      }
    );
  }
});


export default companyInfoSlice.reducer;