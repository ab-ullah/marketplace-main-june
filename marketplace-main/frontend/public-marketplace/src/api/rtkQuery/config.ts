/* eslint-disable import/prefer-default-export */
import axios from 'axios'
import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
import { VIEW_AS_ADVISOR_HEADER } from 'constants/headers'

const API_BASE = process.env.REACT_APP_API_URL

export const baseQuery = retry(
	async (args, api, extraOptions) => {
		const result = await fetchBaseQuery({
			baseUrl: `${API_BASE}/api/`,
			prepareHeaders: headers => {
				const token = axios.defaults.headers.common.Authorization
				const viewAsAdvisor = axios.defaults.headers.common[VIEW_AS_ADVISOR_HEADER] || ""
				if (token) {
					headers.set('Authorization', token.toString())
					headers.set(VIEW_AS_ADVISOR_HEADER,viewAsAdvisor as string)
					headers.set('Content-Type', 'application/json')
				}
				return headers
			},
		})(args, api, extraOptions)

		// if any error, need to try to call this api again
		if (result.error?.status === 503) {
			retry.fail(result.error)
		}
		return result
	},
	{
		maxRetries: 0,
	},
)
