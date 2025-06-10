/* eslint-disable prefer-object-spread */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import {
	fetchTaxForms,
	fetchTaxDocuments,
	fetchAppRecord,
	fetchGeoSelector,
	fetchTaxDetails,
} from './thunks'
import { TaxState } from './interfaces'

const initialState: TaxState = {
	taxForms: [],
	taxDocumentsList: [],
	appRecords: [],
	checkedForms: [],
	geoSelector: [],
	signUrl: {},
	hasFetchedAppRecords: false,
	taxDocumentsListExist: false,
	taxFormsAdmin: [],
	taxFormsLinks: {},
	taxDetails: null,
}

const initialFormsLinkState = {
	status: 'Pending',
	envelope_id: '',
	documentName: '',
	checked: false,
	disabled: false,
	isCreatingEnvelop: false,
	document_id: '',
	record_id: '',
	inputType: '',
}

export const taxSlice = createSlice({
	name: 'taxSlice',
	initialState,
	reducers: {
		setTaxDocuments: (state, action) => {
			state.taxDocumentsList = action.payload
		},
		addSignUrl: (state, action) => {
			state.signUrl[action.payload.envelope_id] = action.payload.signUrl
		},
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		addTaxDocument: (state, { payload }) => {},
		updateLink: (state, { payload }: any) => {
			if (payload) {
				state.taxFormsLinks[payload.id] = Object.assign(
					{},
					initialFormsLinkState,
					state.taxFormsLinks[payload.id],
					payload.linkInfo,
				)
			}
		},
		deleteLink: (state, { payload }) => {
			delete state.taxFormsLinks[payload]
		},
	},
	extraReducers: builder => {
		builder.addCase(fetchTaxForms.fulfilled, (state, actions) => {
			state.taxForms = actions.payload as any
		})
		builder.addCase(fetchTaxDocuments.fulfilled, (state, actions) => {
			const taxDocuments = actions.payload as any
			taxDocuments.forEach((doc: any) => {
				const inputType =
					doc.form.type === 'Goverment' ? 'checkbox' : 'radio'
				const payload = {
					id: doc.form.form_id,
					linkInfo: {
						status:
							doc.completed === 'True' ? 'Completed' : 'Pending',
						envelope_id: doc.envelope_id,
						documentName: doc.form.form_id,
						checked: true,
						disabled: true,
						isCreatingEnvelop: false,
						document_id: doc.document.document_id,
						record_id: doc.record_id,
						inputType,
					},
				}
				taxSlice.caseReducers.updateLink(state, { payload })
			})
			state.taxDocumentsList = actions.payload as any
		})
		builder.addCase(fetchAppRecord.fulfilled, (state, actions) => {
			state.appRecords = actions.payload as any
			state.hasFetchedAppRecords = true
		})
		builder.addCase(fetchGeoSelector.fulfilled, (state, { payload }) => {
			const countries = payload.filter(
				(res: any) => res.label === 'Countries',
			)[0].options
			state.geoSelector = countries
		})
		builder.addCase(fetchTaxDetails.fulfilled, (state, actions) => {
			state.taxDetails = actions.payload as any
		})
	},
})

export const { setTaxDocuments, addSignUrl, updateLink, deleteLink } =
	taxSlice.actions
export default taxSlice.reducer
