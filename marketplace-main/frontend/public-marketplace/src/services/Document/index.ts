/* eslint-disable import/prefer-default-export */
import axios from 'axios'
import download from 'downloadjs'

const BASE_URL = process.env.REACT_APP_API_URL

// For JobInfo Section
export const downloadDocument = async (documentId: string, name: string) => {
	try {
		const response = await axios.get(
			`${BASE_URL}/api/documents/${documentId}`,
			{ responseType: 'blob' },
		)
		const content = response.headers['content-type']
		download(response.data, name, content)
		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const deleteDocument = async (documentId: number) => {
	try {
		const response = await axios.delete(
			`${BASE_URL}/api/documents/${documentId}`,
		)
		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadDocument = async (payload: any) => {
	try {
		const response = await axios.post(
			`${BASE_URL}/api/eligibility_criteria/response/criteria_block/document`,
			payload,
		)
		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}
