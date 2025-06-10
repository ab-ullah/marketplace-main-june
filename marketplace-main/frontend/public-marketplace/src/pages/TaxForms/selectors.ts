import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export const selectAppRecords = createSelector(
	(state: RootState) => state.taxFormsState,
	state => state,
)

export const selectGeoSelector = createSelector(
	(state: RootState) => state.taxFormsState.geoSelector,
	state => state,
)
