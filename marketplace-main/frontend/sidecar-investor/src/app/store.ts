import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import opportunitiesReducer from "../pages/Opportunities/opportunitiesSlice";
import fundInvestorDetailReducer from "../pages/FundInvestorDetail/fundInvestorDetailSlice";
import investorOwnershipReducer from "../pages/InvestorOwnership/investorOwnershipSlice";
import noticesSlice from '../pages/Notices/noticesSlice';
import indicationOfInterestReducer from '../pages/IndicationOfInterest/indicationOfInterestSlice';
import requestAllocationReducer from "../pages/RequestAllocation/requestAllocationSlice";
import capitalCallReducer from "../pages/CapitalCall/capitalCallSlice";
import userReducer from "../pages/User/userSlice";
import companyInfoReducer from "../pages/CompanyInfo/companyInfoSlice";
import fundProfileReducer from "../pages/FundProfile/fundProfileSlice";
import indicateInterestReducer from "../pages/IndicateInterest/indicateInterestSlice";
import kycReducer from '../pages/KnowYourCustomer/kycSlice';
import { api as commonApi } from '../api/rtkQuery/commonApi';
import { api as tasksApi } from '../api/rtkQuery/tasksApi';
import { api as fundsApi } from '../api/rtkQuery/fundsApi';
import { api as agreementsApi } from '../api/rtkQuery/agreementsApi';
import { api as pageConfigsApi } from '../api/rtkQuery/pageConfigsApi';
import eligibilityCriteriaReducer from "../pages/EligibilityCriteria/eligibilityCriteriaSlice";
import taxReducer from "../pages/TaxForms/taxRecordsSlice";
import firmNoticeDetailSlice from "../pages/FirmNoticeDetail/firmNoticeDetailSlice";


export const store = configureStore({
  reducer: {
    opportunitiesState: opportunitiesReducer,
    fundInvestorDetailState: fundInvestorDetailReducer,
    indicationOfInterestState: indicationOfInterestReducer,
    investorOwnershipState: investorOwnershipReducer,
    requestAllocationState: requestAllocationReducer,
    capitalCallState: capitalCallReducer,
    userState: userReducer,
    companyInfo: companyInfoReducer,
    fundProfileInfo: fundProfileReducer,
    indicateInterest: indicateInterestReducer,
    knowYourCustomerState: kycReducer,
    eligibilityCriteriaState: eligibilityCriteriaReducer,
    taxFormsState: taxReducer,
    noticesState: noticesSlice,
    firmNoticeDetailState: firmNoticeDetailSlice,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [fundsApi.reducerPath]: fundsApi.reducer,
    [agreementsApi.reducerPath]: agreementsApi.reducer,
    [commonApi.reducerPath]: commonApi.reducer,
    [pageConfigsApi.reducerPath]: pageConfigsApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      tasksApi.middleware,
      fundsApi.middleware,
      commonApi.middleware,
      pageConfigsApi.middleware,
    ]),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>;
