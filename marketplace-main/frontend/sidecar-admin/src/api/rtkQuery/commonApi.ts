import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";
import {
  CARRY_HURDLE_FLAG,
  CARRY_MANAGEMENT_COMMITMENTS_TAB,
  CARRY_PLAN_PUBLISH_FLOW_FLAG,
  CARRY_POINTS_TRANSFER_FLAG,
  CARRY_SUBPOOLS_FLAG,
  CARRY_VALUE_ADJUSTMENT_FLAG,
  EXCEL_EXPORT_FLAG,
  MANAGER_REPORT_VIEW_FLAG
} from "../../constants/featureFlags";

export const api = createApi({
  baseQuery,
  reducerPath: "commonApi",
  tagTypes: [],
  endpoints: (build) => ({
    getCurrencies: build.query({
      query: () => `currencies/`,
    }),
    getAdminUsers: build.query({
      query: () => `admin_users/company`,
    }),
    getMeAdminUser: build.query<any, void>({
      query: () => `admin_users/me`,
    }),
    getUserInfo: build.query<any, void>({
      query: () => `/users/info`,
    }),
    getCompensationHistoryConfig: build.query<any, void>({
      query: () => `/page_configs/compensation_view`,
    }),
    getExcelExportFlag: build.query<any, void>({
      query: () => `/feature_flags/${EXCEL_EXPORT_FLAG}`,
    }),
    getCarrySubpoolsFlag: build.query<any, void>({
      query: () => `/feature_flags/${CARRY_SUBPOOLS_FLAG}`,
    }),
    getCarryPointsTransferFlag: build.query<any, void>({
      query: () => `/feature_flags/${CARRY_POINTS_TRANSFER_FLAG}`,
    }),
    getCarryPublishFlowFlag: build.query<any, void>({
      query: () => `/feature_flags/${CARRY_PLAN_PUBLISH_FLOW_FLAG}`,
    }),
    getCarryHurdleFlag: build.query<any, void>({
      query: () => `/feature_flags/${CARRY_HURDLE_FLAG}`,
    }),
    getManagerReportViewFlag: build.query<any, void>({
      query: () => `/feature_flags/${MANAGER_REPORT_VIEW_FLAG}`,
    }),
    getCommitmentTabViewFlag: build.query<any, void>({
      query: () =>`/feature_flags/${CARRY_MANAGEMENT_COMMITMENTS_TAB}`
    }),
    getCarryAdjustmentValueFlag: build.query<any, void>({
      query: () =>`/feature_flags/${CARRY_VALUE_ADJUSTMENT_FLAG}`
    }),
    getFeatureFlags: build.query({
      query: () => `admin/feature_flags`
    }),
    getOnboardingCustomText: build.query({
      query: () => `/page_configs/onboarding-custom-text`
    })
   }),
});

export const {
  useGetCurrenciesQuery,
  useGetAdminUsersQuery,
  useGetMeAdminUserQuery,
  useGetUserInfoQuery,
  useGetCompensationHistoryConfigQuery,
  useGetExcelExportFlagQuery,
  useGetCarrySubpoolsFlagQuery,
  useGetCarryPointsTransferFlagQuery,
  useGetCarryPublishFlowFlagQuery,
  useGetCarryHurdleFlagQuery,
  useGetFeatureFlagsQuery,
  useGetManagerReportViewFlagQuery,
  useGetOnboardingCustomTextQuery,
  useGetCommitmentTabViewFlagQuery,
  useGetCarryAdjustmentValueFlagQuery
} = api;
