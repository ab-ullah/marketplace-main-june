import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit';
import fundsReducer from "../pages/Funds/fundsSlice";
import fundDemandReducer from "../pages/FundDemand/fundDemandSlice";
import fundInvestorsReducer from "../pages/FundInvestors/fundInvestorsSlice";
import adminDashboardReducer from "../pages/AdminDashboard/adminDashboardSlice";
import UserReducer from "../pages/Users/usersSlice";
import CompaniesReducer from "../pages/Companies/companiesSlice";
import EligibilityCriteriaReducer from "../pages/EligibilityCriteria/eligibilityCriteriaSlice";
import EligibilityCriteriaPreviewReducer from "../pages/EligibilityCriteriaPreview/eligibilityCriteriaPreviewSlice";
import FundMarketingPageReducer from "../pages/FundMarketingPageCreation/fundMarketingPageSlice";
import MarketingPagesReducer from "../pages/MarketingPages/marketingPagesSlice";
import FundMarketingPagePreviewReducer from "../pages/FundMarketingPagePreview/previewFundMarketingPageSlice";
import TaskReducer  from "../pages/Tasks/tasksSlice";
import TaskReviewReducer  from "../pages/TaskReview/taskReviewSlice";
import FundDetailReducer from "../pages/FundDetail/fundDetailSlice";
import KYCReducer from "../pages/KnowYourCustomer/kycSlice";
import TaxReducer from "../pages/KnowYourCustomer/taxRecordsSlice";
import FundSetupReducer from "../pages/FundSetup/fundSetupSlice";
import { api as kycApi } from "../api/rtkQuery/kycApi";
import { api as fundsApi } from "../api/rtkQuery/fundsApi";
import { api as eligibilityApi } from "../api/rtkQuery/eligibilityApi";
import { api as commonApi } from "../api/rtkQuery/commonApi";
import { api as companyApi } from "../api/rtkQuery/companyApi";
import { api as taxApi } from "../api/rtkQuery/taxApi";
import { api as usersApi } from "../api/rtkQuery/usersApi";
import { api as employeeApi } from "../api/rtkQuery/employeeApi";
import { carryApi } from '../api/rtkQuery/carryApi';

export const store = configureStore({
  reducer: {
    fundsState: fundsReducer,
    fundDemandState: fundDemandReducer,
    fundInvestorsState: fundInvestorsReducer,
    fundSetupReducer: FundSetupReducer,
    adminDashboardState: adminDashboardReducer,
    userState: UserReducer,
    companiesState: CompaniesReducer,
    eligibilityCriteriaState: EligibilityCriteriaReducer,
    eligibilityCriteriaPreviewState: EligibilityCriteriaPreviewReducer,
    fundMarketingPageState: FundMarketingPageReducer,
    marketingPagesState: MarketingPagesReducer,
    previewMarketingPagesState: FundMarketingPagePreviewReducer,
    tasksState: TaskReducer,
    taskReviewState: TaskReviewReducer,
    fundDetailState: FundDetailReducer,
    knowYourCustomerState: KYCReducer,
    [kycApi.reducerPath]: kycApi.reducer,
    taxFormsState: TaxReducer,
    [fundsApi.reducerPath]: fundsApi.reducer,
    [eligibilityApi.reducerPath]: eligibilityApi.reducer,
    [commonApi.reducerPath]: commonApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [taxApi.reducerPath]: taxApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [carryApi.reducerPath]: carryApi.reducer
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      kycApi.middleware,
      fundsApi.middleware,
      eligibilityApi.middleware,
      commonApi.middleware,
      companyApi.middleware,
      taxApi.middleware,
      usersApi.middleware,
      employeeApi.middleware,
      carryApi.middleware
    ]),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>;
