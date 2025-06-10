import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";
import { carryPlansConfig } from "../../interfaces/company";

export const api = createApi({
  baseQuery,
  reducerPath: "companyApi",
  tagTypes: ["COMPANY_INFO", "reports"],
  endpoints: (build) => ({
    getCompanyInfo: build.query({
      query: () => `admin/companies/`,
      providesTags: ["COMPANY_INFO"]
    }),
    getCompanyDocumentOptions: build.query<any, void>({
      query: () => `admin/companies/documents-options`,
    }),
    updateCompanyInfo: build.mutation({
      query: (body) => ({
        url: `admin/companies/`,
        method: "PATCH",
        body,
      }),
      // invalidatesTags: ["COMPANY_INFO"]
    }),
    updateCompanyProfile: build.mutation({
      query: (body) => ({
        url: `admin/companies/profile`,
        method: "PATCH",
        body,
      }),
      // invalidatesTags: ["COMPANY_INFO"]
    }),
    deleteCompanyProfile: build.mutation({
      query: (id) => ({
        url: `admin/companies/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["COMPANY_INFO"]
    }),
    getCompanyReports: build.query<any, void>({
      query: () => `admin/companies/reports`,
      providesTags: ["reports"]
    }),
    requestCarryExport: build.mutation({
      query: (body) => ({
        url: `admin/carry_pools/carry-plans/export`,
        method: "POST",
        body,
      }),
    }),
    requestAllocationsExport: build.mutation({
      query: (body) => ({
        url: `admin/carry_pools/allocations/export`,
        method: "POST",
        body,
      }),
    }),
    getCarryPlansConfig: build.query<carryPlansConfig, void>({
      query: () => ({
        url: `/page_configs/carry_config`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCompanyInfoQuery,
  useUpdateCompanyInfoMutation,
  useUpdateCompanyProfileMutation,
  useDeleteCompanyProfileMutation,
  useGetCompanyReportsQuery,
  useGetCompanyDocumentOptionsQuery,
  useRequestCarryExportMutation,
  useRequestAllocationsExportMutation,
  useGetCarryPlansConfigQuery
 } = api;
