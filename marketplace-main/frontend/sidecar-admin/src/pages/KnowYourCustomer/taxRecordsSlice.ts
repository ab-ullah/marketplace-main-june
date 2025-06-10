import { createSlice } from "@reduxjs/toolkit";
import {
  fetchTaxRecords,
  fetchGeoSelector,
  fetchTaxFormsAdmin,
  fetchTaxDetailsAdmin,
} from "./thunks";
import { TaxState } from "./interfaces";

const initialState: TaxState = {
  taxForms: [],
  taxDocumentsList: [],
  taxRecords: [],
  checkedForms: [],
  geoSelector: [],
  signUrl: {},
  taxRecordsExist: false,
  taxDocumentsListExist: false,
  taxFormsAdmin: [],
  taxDetails: null,
};

export const taxSlice = createSlice({
  name: "taxSlice",
  initialState,
  reducers: {
    setTaxDocuments: (state, action) => {
      state.taxDocumentsList = action.payload;
    },
    addSignUrl: (state, action) => {
      state.signUrl[action.payload.envelope_id] = action.payload.signUrl;
    },
    clearTaxState(){
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTaxRecords.fulfilled, (state, actions) => {
      state.taxRecords = actions.payload as any;
      state.taxRecordsExist = true;
    });
    builder.addCase(fetchGeoSelector.fulfilled, (state, {payload}) => {
      const countries = payload.filter((res: any) => res.label === "Countries")[0].options;
      state.geoSelector = countries;
    });
    builder.addCase(fetchTaxFormsAdmin.fulfilled, (state, actions) => {
      state.taxFormsAdmin = actions.payload as any;
    });
    builder.addCase(fetchTaxDetailsAdmin.fulfilled, (state, actions) => {
      state.taxDetails = actions.payload as any;
    });
  },
});

export const { setTaxDocuments, addSignUrl, clearTaxState } = taxSlice.actions;
export default taxSlice.reducer;
