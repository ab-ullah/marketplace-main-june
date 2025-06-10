/* eslint-disable import/prefer-default-export */
import axios from 'axios'
import _ from 'lodash'

const BASE_URL = process.env.REACT_APP_API_URL

// For JobInfo Section
export const getCountries = async (externalId: string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/geographics/region_countries/${externalId}`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const submitJobInfo = async (externalId: string, values: any) => {
	try {
		const { origin_country, entity_type } = values
		const body = _.omit(values, ['origin_country', 'entity_type'])
		const response = await axios.post(
			`${BASE_URL}/api/eligibility_criteria/response/${externalId}/${origin_country.value}/${entity_type}`,
			body,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const getEligibilityData = async (externalId: string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/eligibility_criteria/response/${externalId}/fetch`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const getEligibilityDocs = async (responseId: number | string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/eligibility_criteria/response/${responseId}/documents`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const getEligibilityStatus = async (responseId: number | string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/eligibility_criteria/response/${responseId}/status`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const getApplicationStatus = async (externalId: string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/applications/application-workflow-status/${externalId}`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const updateCriteriaPosition = async (
	responseId: number,
	body: { last_position: number },
) => {
	try {
		const response = await axios.patch(
			`${BASE_URL}/api/eligibility_criteria/response/${responseId}/update`,
			body,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

// For RadioButtonBlock

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateResponseBlock = async (body: any) => {
	try {
		const response = await axios.post(
			`${BASE_URL}/api/eligibility_criteria/response/criteria_block/`,
			body,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createInvestmentAmount = async (
	responseId: number,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: any,
	skipTask?: boolean,
) => {
	try {
		let url = `${BASE_URL}/api/eligibility_criteria/response/${responseId}/investment_amount`
		if (skipTask) url = `${url}?skip_task=true`
		const response = await axios.post(url, payload)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const fetchCriteriaBlock = async (blockId: any, direction: string, externalId: string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/eligibility_criteria/${externalId}/criteria_block/${blockId}/${direction}/block`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}