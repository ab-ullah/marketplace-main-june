import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { api as tasksApi } from '../api/rtkQuery/tasksApi'
import { api as fundsApi } from '../api/rtkQuery/fundsApi'
import { api as agreementsApi } from '../api/rtkQuery/agreementsApi'
import { api as commonApi } from '../api/rtkQuery/commonApi'
import KYCReducer from '../pages/KnowYourCustomer/kycSlice'
import TaxRecordsSlice from '../pages/TaxForms/taxRecordsSlice'
import eligibilityCriteriaReducer from '../pages/OpportunityOnboarding/eligibilityCriteriaSlice'
import indicateInterestReducer from '../pages/IndicateInterest/indicateInterestSlice';
import userReducer from "../pages/User/userSlice";

export const store = configureStore({
	reducer: {
		[tasksApi.reducerPath]: tasksApi.reducer,
		[fundsApi.reducerPath]: fundsApi.reducer,
		[agreementsApi.reducerPath]: agreementsApi.reducer,
		[commonApi.reducerPath]: commonApi.reducer,
		knowYourCustomerState: KYCReducer,
		eligibilityCriteriaState: eligibilityCriteriaReducer,
		taxFormsState: TaxRecordsSlice,
    indicateInterest: indicateInterestReducer,
		userState: userReducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat([
			tasksApi.middleware,
			fundsApi.middleware,
			agreementsApi.middleware,
			commonApi.middleware,
		]),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>
