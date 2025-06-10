import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";

export const api = createApi({
  baseQuery,
  reducerPath: "commonApi",
  tagTypes: [],
  endpoints: (build) => ({
    getCompanyInfo: build.query({
      query: (externalId) => `/funds/external_id/${externalId}/company_info`,
      keepUnusedDataFor: 0,
    }),
    getCurrencies: build.query({
      query: (externalId: string) => `currencies/fund/${externalId}`,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetCurrenciesQuery, useGetCompanyInfoQuery } = api;
