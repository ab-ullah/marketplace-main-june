import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQuery} from "./config";
import {IOpportunity} from "../../pages/Opportunities/interfaces"
import {IActiveApplicationFund, IInvestedCount} from "../../interfaces/applicationStatus";
import {PendingCarryDocumentTask} from "../../interfaces/carryManagement";

export const tagTypes = ["userTasks", "userOpportunities","withdrawnOpportunities", "userInProgressWorkflow", "investedCount", "activeApplications", "pendingCarryDocuments"]

export const api = createApi({
  baseQuery,
  reducerPath: "tasksApi",
  tagTypes,
  endpoints: (build) => ({
    getUserOpportunities: build.query<IOpportunity[], void>({
      query: () => `/investors/opportunities/`,
      providesTags: ["userOpportunities"],
    }),
    getWithdrawnOpportunities: build.query<IOpportunity[], void>({
      query: () => `/investors/past-opportunities/`,
      providesTags: ["withdrawnOpportunities"],
    }),
    getInvestedCount: build.query<IInvestedCount, void>({
      query: () => `/investors/invested-count/`,
      providesTags: ["investedCount"],
    }),
    getActiveApplicationFund: build.query<IActiveApplicationFund[], void>({
      query: () => `/investors/active-applications/`,
      providesTags: ["activeApplications"],
    }),
    getUserTasks: build.query<any, void>({
      query: () => `/workflows/user-tasks/`,
      providesTags: ["userTasks"],
    }),
    getUserInProgressWorkflow: build.query<any, void>({
      query: () => `/workflows/user-tasks/in-progress`,
      providesTags: ["userInProgressWorkflow"],
    }),
    getPendingCarryDocuments: build.query<PendingCarryDocumentTask, void>({
      query: () => `/carry_plans/pending_documents`,
      providesTags: ["pendingCarryDocuments"],
    }),
  }),
});

export const {
  useGetUserTasksQuery,
  useGetUserOpportunitiesQuery,
  useGetWithdrawnOpportunitiesQuery,
  useGetUserInProgressWorkflowQuery,
  useGetInvestedCountQuery,
  useGetActiveApplicationFundQuery,
  useGetPendingCarryDocumentsQuery
} = api;
