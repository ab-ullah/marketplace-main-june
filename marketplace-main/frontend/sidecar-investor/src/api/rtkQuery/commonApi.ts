import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";
import {
  CARRY_MANAGEMENT_COMMITMENTS,
  COINVEST,
  INVESTMENT_HISTORIC_DATA,
  INVESTMENT_SUMMARY_DATE_FILTERING,
  MULTIPLE_PORTFOLIO_CURRENCIES,
  INVESTOR_PORTFOLIO_PAGE
} from "../../constants/featureFlags";

import {carryPlansConfig} from "../../interfaces/PageConfigs/carry";

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
    getExcelExportFlag: build.query<any, void>({
      query: () => `/feature_flags/excel_export_flag`,
    }),
    getInvestmentSummaryDateFilteringFeatureFlag: build.query<any, void>({
      query: () => `/feature_flags/${INVESTMENT_SUMMARY_DATE_FILTERING}`,
    }),
    getPortfolioFilteringFeatureFlag: build.query<any, void>({
      query: () => `/feature_flags/${INVESTMENT_HISTORIC_DATA}`,
    }),
    getCoinvestFeatureFlag: build.query<any, void>({
      query: () => `/feature_flags/${COINVEST}`
    }),
    getPortfolioPageFeatureFlag: build.query<any, void>({
      query: () => `/feature_flags/${INVESTOR_PORTFOLIO_PAGE}`
    }),
    getCompensationHistoryConfig: build.query<any, void>({
      query: () => `/page_configs/compensation_view`,
    }),
    getCarryPlansConfig: build.query<carryPlansConfig, void>({
      query: () => `/page_configs/carry_config`,
    }),
    getCommitmentFeatureFlag: build.query<any, void>({
      query: () => `/feature_flags/${CARRY_MANAGEMENT_COMMITMENTS}`
    }),
    getCurrencyFeatureFlag: build.query<any, void>({
      query: () => `/feature_flags/${MULTIPLE_PORTFOLIO_CURRENCIES}`
    }),
  }),
});

export const {
  useGetCurrenciesQuery,
  useGetCompanyInfoQuery,
  useGetExcelExportFlagQuery,
  useGetInvestmentSummaryDateFilteringFeatureFlagQuery,
  useGetPortfolioFilteringFeatureFlagQuery,
  useGetCoinvestFeatureFlagQuery,
  useGetCommitmentFeatureFlagQuery,
  useGetCurrencyFeatureFlagQuery,
  useGetPortfolioPageFeatureFlagQuery,
  useGetCompensationHistoryConfigQuery,
  useGetCarryPlansConfigQuery
} = api;
