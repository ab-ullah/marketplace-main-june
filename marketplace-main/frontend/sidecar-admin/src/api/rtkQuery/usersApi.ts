import {createApi} from "@reduxjs/toolkit/query/react";
import {baseQuery} from "./config";

export const api = createApi({
  baseQuery,
  reducerPath: "usersApi",
  tagTypes: ["users", "groups", "investors"],
  endpoints: (build) => ({
    getUsers: build.query<any, void>({
      query: () =>
        `admin/users/all`,
      providesTags: ["users"],
    }),
    getGroups: build.query<any, void>({
      query: () =>
        `admin/companies/groups`,
      providesTags: ["groups"],
    }),
    createUser: build.mutation({
      query: ({...body}) => ({
        url: `admin/users/create`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["users"]
    }),
    updateUser: build.mutation({
      query: ({userId, ...body}) => ({
        url: `admin/users/${userId}/update`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["users"]
    }),
    deleteUser: build.mutation({
      query: ({ userId }) => ({
        url: `admin/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"]
    }),
    getInvestors: build.query<any, void>({
      query: () =>
        `admin/investors/investors/`,
      providesTags: ["users"],
    }),
  }),
});


export const {
  useGetUsersQuery,
  useGetGroupsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetInvestorsQuery
} = api;
