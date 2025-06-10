import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";

export const api = createApi({
  baseQuery,
  reducerPath: "kycApi",
  tagTypes: ["InvestmentAmount", "kycDocuments", "kycDocumentOptions"],
  endpoints: (build) => ({
    getKYCInvestmentAmount: build.query({
      query: (externalId) =>
        `admin/eligibility_criteria/response/${externalId}/investment_amount`,
      providesTags: ["InvestmentAmount"],
    }),
    getKYCDocuments: build.query({
      query: (applicationId) =>
        `admin/kyc_records/application/${applicationId}/info`,
      providesTags: ["kycDocuments"],
    }),
    getKYCDocumentOptions: build.query<any, void>({
      query: () =>
        `admin/kyc_records/document-options`,
      providesTags: ["kycDocumentOptions"],
    }),

    updateKycDocument: build.mutation({
      query: ({ kycRecordId, kycDocumentId, ...body }) => ({
        url: `admin/kyc_records/${kycRecordId}/documents/${kycDocumentId}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["kycDocuments"]
    }),

    updateApplicant: build.mutation({
      query: ({ id, ...body }) => ({
        url: `admin/eligibility_criteria/investment/${id}/update`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InvestmentAmount"]
    }),

    updateTransfers: build.mutation({
      query: ({ id, ...body }) => ({
        url: `admin/transfers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InvestmentAmount"]
    }),

    updateKYCRecord: build.mutation({
      query: ({ recordId, workflowSlug, ...body }) => ({
        url: `admin/kyc_records/workflows/${workflowSlug}/kyc_records/${recordId}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["InvestmentAmount"]
    }),

    updateApplicantStatus: build.mutation({
      query: (data) => ({
        url: `admin/applications/actions/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["InvestmentAmount"]
    }),

    resetApplicants: build.mutation({
      query: (data) => ({
        url: `admin/applications/reset/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["InvestmentAmount"]
    }),

    removeSelectedApplicant: build.mutation({
      query: ({ fundExternalId, ...body }) => ({
        url: `admin/applications/fund/${fundExternalId}/delete`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["InvestmentAmount"]
    }),

    updateApplicationVehicleAndShareClass: build.mutation({
      query: (data) => ({
        url: `admin/applications/update/`,
        method: "POST",
        body: data,
      }),
    }),

    updateInvestorCode: build.mutation({
      query: ({applicationId, ...data}) => ({
        url: `admin/applications/${applicationId}/investor-account-code`,
        method: "POST",
        body: data,
      }),
    }),
    updateKYCDocumentFields: build.mutation({
      query: ({ uuid, ...body }) => ({
        url: `admin/kyc_records/${uuid}/update`,
        method: "PATCH",
        body,
      })
    }),
    updatePaymentDetailsFields: build.mutation({
      query: ({ id, ...body }) => ({
        url: `admin/payment_detail/${id}`,
        method: "PATCH",
        body,
      })
    }),
    createKYCDocumentFields: build.mutation({
      query: (body) => ({
        url: `admin/kyc_records/user/kyc-records`,
        method: "POST",
        body,
      })
    }),
  }),
});

export const {
  useGetKYCInvestmentAmountQuery,
  useGetKYCDocumentsQuery,
  useGetKYCDocumentOptionsQuery,
  useUpdateKycDocumentMutation,
  useUpdateApplicantMutation,
  useUpdateKYCRecordMutation,
  useUpdateInvestorCodeMutation,
  useUpdateApplicantStatusMutation,
  useRemoveSelectedApplicantMutation,
  useUpdateApplicationVehicleAndShareClassMutation,
  useUpdateKYCDocumentFieldsMutation,
  useCreateKYCDocumentFieldsMutation,
  useResetApplicantsMutation,
  useUpdateTransfersMutation,
  useUpdatePaymentDetailsFieldsMutation,
} = api;
