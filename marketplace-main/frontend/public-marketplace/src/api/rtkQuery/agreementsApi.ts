import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQuery} from "./config";

export const api = createApi({
  baseQuery,
  reducerPath: "agreementsApi",
  tagTypes: ["agreements", "witness"],
  endpoints: (build) => ({
    getAgreements: build.query({
      query: (externalId) => `/agreements/${externalId}`,
      providesTags: ["agreements"],
    }),
    getWitness: build.query({
      query: (externalId) => `/agreements/${externalId}/witness`,
      providesTags: ["witness"],
    }),
    createWitness: build.mutation({
      query: ({ externalId, ...body }) => ({
        url: `/agreements/${externalId}/witness`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["agreements", "witness"]
    }),
  }),
});

export const { useGetAgreementsQuery, useGetWitnessQuery, useCreateWitnessMutation } = api;
