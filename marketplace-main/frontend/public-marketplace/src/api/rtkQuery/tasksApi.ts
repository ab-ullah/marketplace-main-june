/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react'
import { IOpportunity } from 'interfaces/Opportunities'
import {
	IActiveApplicationFund,
	IInvestedCount,
} from 'interfaces/common/applicationStatus'
import { baseQuery } from './config'

export const tagTypes = [
	'userTasks',
	'userOpportunities',
	'userInProgressWorkflow',
	'investedCount',
	'activeApplications',
]

export const api = createApi({
	baseQuery,
	reducerPath: 'tasksApi',
	tagTypes,
	endpoints: build => ({
		getUserOpportunities: build.query<IOpportunity[], void>({
			query: () => `/investors/opportunities/`,
			providesTags: ['userOpportunities'],
		}),
		getInvestedCount: build.query<IInvestedCount, void>({
			query: () => `/investors/invested-count/`,
			providesTags: ['investedCount'],
		}),
		getActiveApplicationFund: build.query<IActiveApplicationFund[], void>({
			query: () => `/investors/active-applications/`,
			providesTags: ['activeApplications'],
		}),
		getUserTasks: build.query<any, void>({
			query: () => `/workflows/user-tasks/`,
			providesTags: ['userTasks'],
		}),
		getUserInProgressWorkflow: build.query<any, void>({
			query: () => `/workflows/user-tasks/in-progress`,
			providesTags: ['userInProgressWorkflow'],
		}),
	}),
})

export const {
	useGetUserTasksQuery,
	useGetUserOpportunitiesQuery,
	useGetUserInProgressWorkflowQuery,
	useGetInvestedCountQuery,
	useGetActiveApplicationFundQuery,
} = api
