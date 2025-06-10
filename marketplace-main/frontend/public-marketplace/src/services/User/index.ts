/* eslint-disable import/prefer-default-export */
import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL

export const getUserInfo = async () => {
	try {
		const response = await axios.get(`${BASE_URL}/api/users/info`)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}

export const getCompanyTheme = async (company:string) => {
	try {
		const response = await axios.get(`${BASE_URL}/api/companies/${company}/theme`)

		return { success: true, data: response.data }
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		return { success: false, message: err.message }
	}
}