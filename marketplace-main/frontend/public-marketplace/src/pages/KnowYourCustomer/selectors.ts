import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

// eslint-disable-next-line import/prefer-default-export
export const selectKYCRecord = createSelector(
	(state: RootState) => state.knowYourCustomerState,
	state => state,
)

export const selectIsEligible = createSelector(
	(state: RootState) => state.knowYourCustomerState.IsEligible,
	state => state,
)