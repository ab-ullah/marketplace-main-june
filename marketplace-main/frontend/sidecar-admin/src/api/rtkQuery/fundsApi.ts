import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";

export const api = createApi({
  baseQuery,
  reducerPath: "fundsApi",
  tagTypes: ["FundsList", "AdminApplicationDocuments", "ProgramDocuments"],
  endpoints: (build) => ({
    getFunds: build.query({
      query: (fund_type) => {
        let url = 'admin/funds/';
        if (fund_type) {
          url += `?fund_type=${fund_type}`;
        }
        return url;
      },
      keepUnusedDataFor: 0,
      providesTags: ["FundsList"]
    }),
    updateFunds: build.mutation({
      query: ({ fundId, ...body }) => ({
        url: `admin/funds/${fundId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["FundsList"]
    }),
    /**
     * migrate this api to eligibilityApi.ts after merging PR#325
     */
    bulkPublish: build.mutation({
      query: ({ criteriaIds }) => ({
        url: `admin/eligibility_criteria/bulk-publish`,
        method: "POST",
        body: { criteria_ids: criteriaIds },
      }),
    }),

    updateFundStatus: build.mutation({
      query: ({ fundId, ...body }) => ({
        url: `admin/funds/${fundId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["FundsList"]
    }),

    getDocuments: build.query({
      query: (externalId) => `admin/funds/${externalId}/documents`,
      keepUnusedDataFor: 0,
    }),
    getDocumentsByApplication: build.query({
      query: (applicationId) => `admin/funds/documents/application/${applicationId}`,
      keepUnusedDataFor: 0,
    }),
    getApprovedDocuments: build.query({
      query: (applicationId) => `admin/funds/applications/${applicationId}/documents/response`,
      keepUnusedDataFor: 0,
    }),
    fetchProgramDocs: build.query({
      query: (applicationId) => `admin/applications/funds/${applicationId}/company-documents`,
      keepUnusedDataFor: 0,
      providesTags: ["ProgramDocuments"]
    }),
    fetchExistingAndDeletedProgramDocs: build.query({
      query: (applicationId) => `admin/applications/funds/${applicationId}/existing-and-deleted-company-documents`,
      keepUnusedDataFor: 0,
      providesTags: ["ProgramDocuments"]
    }),
    updateProgramDoc: build.mutation({
      query: ({ docId, applicationId, ...body }) => ({
        url: `admin/applications/funds/${applicationId}/company-documents/${docId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ['ProgramDocuments']
    }),
    updateDocuments: build.mutation({
      query: ({ docId, externalId, ...body }) => ({
        url: `admin/funds/${externalId}/documents/${docId}`,
        method: "PATCH",
        body,
      }),
    }),
    getVehicles: build.query({
      query: (externalId) => `admin/funds/${externalId}/share-classes`,
      keepUnusedDataFor: 0,
    }),
    getDocumentFields: build.query({
      query: (fundSlug) => `admin/funds/${fundSlug}/document-fields/`,
      keepUnusedDataFor: 0,
    }),
    getCountryDocumentIds: build.query<any, void>({
      query: () => `admin/geographics/country_id_documents`,
    }),
    getApplicationDocuments: build.query({
      query: (applicationId) => `admin/applications/${applicationId}/supporting-document`,
      providesTags: ["AdminApplicationDocuments"],
      keepUnusedDataFor: 0,
    }),
    deleteAdminApplicationDocument: build.mutation({
      query: ({ applicationId, id }) => ({
        url: `admin/applications/${applicationId}/supporting-document/${id}`,
        method: "DELETE",
        invalidatesTags: ["AdminApplicationDocuments"]
      }),
    }),
  }),
});

export const {
  useGetFundsQuery,
  useBulkPublishMutation,
  useUpdateFundsMutation,
  useGetDocumentsQuery,
  useFetchExistingAndDeletedProgramDocsQuery,
  useGetApprovedDocumentsQuery,
  useUpdateFundStatusMutation,
  useUpdateDocumentsMutation,
  useGetVehiclesQuery,
  useGetDocumentsByApplicationQuery,
  useGetDocumentFieldsQuery,
  useFetchProgramDocsQuery,
  useUpdateProgramDocMutation,
  useGetApplicationDocumentsQuery,
  useDeleteAdminApplicationDocumentMutation,
  useGetCountryDocumentIdsQuery,
} = api;
