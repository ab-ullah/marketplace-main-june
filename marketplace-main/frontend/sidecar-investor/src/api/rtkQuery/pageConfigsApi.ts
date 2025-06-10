import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQuery} from "./config";
import { CarryPlansConfig, OnboardingCustomText } from "../../interfaces/carryManagement";


export const api = createApi({
  baseQuery,
  reducerPath: "pageConfigApi",
  tagTypes: [],
  endpoints: (build) => ({
    getOwnershipPageConfig: build.query<any, void>({
      query: () => `/page_configs/investor_dashboard`,
    }),
    getInvestmentDetailPageConfig: build.query({
      query: (externalId) => `/page_configs/investment_detail_page?fund_external_id=${externalId}`,
    }),
    getNoticesPageConfig: build.query<any, void>({
      query: () => `/page_configs/notice_considerations`,
    }),
    getFirmNoticesPageConfig: build.query<any, void>({
      query: () => `/page_configs/notice_considerations_firm_detail`,
    }),
    getCarryPlansPageConfig: build.query<CarryPlansConfig, void>({
      query: () => `/page_configs/carry_config`,
    }),
    getOnboardingCustomText: build.query<OnboardingCustomText, void>({
      query: () => `/page_configs/onboarding-custom-text`,
    }),
  }),
});

export const {
  useGetOwnershipPageConfigQuery,
  useGetInvestmentDetailPageConfigQuery,
  useGetNoticesPageConfigQuery,
  useGetFirmNoticesPageConfigQuery,
  useGetCarryPlansPageConfigQuery,
  useGetOnboardingCustomTextQuery
} = api;
