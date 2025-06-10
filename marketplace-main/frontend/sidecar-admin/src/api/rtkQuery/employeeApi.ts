import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./config";

export const api = createApi({
    baseQuery,
    reducerPath: "employeeApi",
    tagTypes: ["jobBands", "departments", "officeLocations", "companyRoles"],
    endpoints: (build) => ({
        getJobBands: build.query({
            query: () => `admin/employees/job_bands`,
            providesTags: ["jobBands"]
        }),
        getDepartments: build.query({
            query: () => `admin/employees/departments`,
            providesTags: ["departments"]
        }),
        getOfficeLocations: build.query({
            query: () => `admin/employees/office_locations`,
            providesTags: ["officeLocations"]
        }),
        getEmploymentFilters: build.query({
            query: () => `admin/employees/filters`,
            providesTags: ["officeLocations"]
        }),
        getCompanyRoles: build.query({
            query: () => `admin/employees/company_roles`,
            providesTags: ["companyRoles"]
        }),
        updateParticipantProfile: build.mutation({
            query: ({ user_id, ...body }) => ({
                url: `admin/carry_pools/participants/${user_id}/profile`,
                method: "PATCH",
                body,
            }),    
        }),
        updateEmploymentRecord: build.mutation({
            query: ({ user_id, ...body }) => ({
                url: `admin/carry_pools/participants/${user_id}/employment_record`,
                method: "PATCH",
                body,
            }),    
        }),
        fetchEmployeeProfile: build.query({
            query: ({ user_id }) => ({
                url: `admin/carry_pools/participants/${user_id}/profile`,
                method: "GET",
            }),    
        }),
    }),
});

export const {
    useGetJobBandsQuery,
    useGetDepartmentsQuery,
    useGetCompanyRolesQuery,
    useGetOfficeLocationsQuery,
    useUpdateParticipantProfileMutation,
    useUpdateEmploymentRecordMutation,
    useFetchEmployeeProfileQuery,
    useGetEmploymentFiltersQuery,
} = api;
