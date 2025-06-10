import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ICompany, ICompanyToken} from "../../interfaces/company";
import {fetchCompanies, fetchCompanyTokens, fetchInvestorDocuments, fetchInvestorDocumentsFilters, fetchInvestorDocumentsNext} from "./thunks";

export interface CompanyState {
  companies: ICompany[];
  companyTokens: ICompanyToken[];
  investorDocuments: any;
  investorDocumentsFilters : Record<string,any>
}

const initialState: CompanyState = {
  companies: [],
  companyTokens: [],
  investorDocuments: {
    results: [],
    next: null
  },
  investorDocumentsFilters:{}
};

export const companiesSlice = createSlice({
  name: 'companiesSlice',
  initialState,
  reducers: {
    addCompanyToken: (state, action: PayloadAction<ICompanyToken>) => {
      state.companyTokens = [...state.companyTokens, action.payload];
    },
    editCompanyToken: (state, action: PayloadAction<ICompanyToken>) => {
      state.companyTokens = state.companyTokens.map((companyToken) => {
        if (companyToken.id === action.payload.id) return action.payload
        return companyToken
      });
    },
    deleteToken: (state, action: PayloadAction<number>) => {
      state.companyTokens = [...state.companyTokens.filter(token => token.id !== action.payload)]
    }
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchCompanies.fulfilled, (state, {payload}) => {
        state.companies = payload;
      }
    );

    builder.addCase(
      fetchCompanyTokens.fulfilled, (state, {payload}) => {
        state.companyTokens = payload;
      }
    );
    builder.addCase(
      fetchInvestorDocumentsFilters.fulfilled, (state, {payload}) => {
        state.investorDocumentsFilters = payload;
      }
    );
    builder.addCase(
      fetchInvestorDocuments.fulfilled, (state, {payload}) => {
        state.investorDocuments.results = payload.results;
        state.investorDocuments.next = payload.links.next;
      }
    );
    builder.addCase(
      fetchInvestorDocumentsNext.fulfilled, (state, {payload}) => {
        state.investorDocuments.results = [...state.investorDocuments.results, ...payload.results];
        state.investorDocuments.next = payload.links.next;
      }
    );
  }
});


export const {addCompanyToken, editCompanyToken, deleteToken} = companiesSlice.actions;


export default companiesSlice.reducer;