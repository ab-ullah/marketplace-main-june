/* eslint-disable import/prefer-default-export */
import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL

// For JobInfo Section
export const getFund = async (externalId?: string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/funds/external_id/${externalId}`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

// For Documents Section
export const getFundDocuments = async (externalId?: string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/funds/external_id/${externalId}/public/documents`,
		)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}
