import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQuery} from "./config";

export const api = createApi({
  baseQuery,
  reducerPath: "taxApi",
  tagTypes: ["taxDocuments", "taxForms"],
  endpoints: (build) => ({
    getTaxDocuments: build.query({
      query: (taxRecordId) =>
        `admin/tax_records/${taxRecordId}/documents/all`,
      providesTags: ["taxDocuments"],
    }),
    getTaxDocumentOptions: build.query<any, void>({
      query: () =>
        `admin/tax_records/tax-forms`,
      providesTags: ["taxForms"],
    }),

    updateTaxDocument: build.mutation({
      query: ({taxRecordId, taxDocumentId, applicationId, ...body}) => ({
        url: `admin/tax_records/${taxRecordId}/documents/${taxDocumentId}/application/${applicationId}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["taxDocuments"]
    })
  }),
});


export const {
  useGetTaxDocumentsQuery,
  useGetTaxDocumentOptionsQuery,
  useUpdateTaxDocumentMutation
} = api;
