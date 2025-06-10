import React, {FunctionComponent, useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {USER_GUIDE} from "../../constants/urlHashes";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {selectUserInfo} from "../User/selectors";
import {fetchInvestor, fetchInvestorCurrencies} from "./thunks";
import {selectCurrency, selectInvestorOwnership} from "./selectors";
import {setInvestor} from "./investorOwnershipSlice";
import {createTotalRow} from "./components/InvestedFunds/computations";
import TopDashboard from "./components/TopDashboard";
import {LoggedInFooter} from "../../components/Footer";
import NoDataToast from "../../components/NoDataToast";
import TableTabsView from "./components/TabsView";
import useScreenWidth from "../../hooks/useScreenWidth";
import DesktopViewTables from "./components/DesktopViewTables";
import WelcomeModal from "../../components/WelcomeCarousel/WelcomeModal";
import API from "../../api"
import {useGetOwnershipPageConfigQuery} from "../../api/rtkQuery/pageConfigsApi";
import { generateDateParamsFromRange } from '../../utils/dateFormatting';
import { useGetCurrencyFeatureFlagQuery } from '../../api/rtkQuery/commonApi';


interface InvestorOwnershipProps {
  isLegacy: boolean
}


const InvestorOwnership: FunctionComponent<InvestorOwnershipProps> = () => {
  const investorOwnership = useAppSelector(selectInvestorOwnership);
  const {data: ownershipConfig} = useGetOwnershipPageConfigQuery()
  const { data: currencyFeatureFlag, isLoading } = useGetCurrencyFeatureFlagQuery();
  const userInfo:any = useAppSelector(selectUserInfo);
  const selectedCurrency = useAppSelector(selectCurrency);

  const [dateRange, setDateRange] = useState({startDate: null, endDate: null})

  const dispatch = useAppDispatch();
  const {isSmall} = useScreenWidth();
  const location = useLocation();

  useEffect(() => {
    const dateParams = generateDateParamsFromRange(dateRange)
    dispatch(fetchInvestor(dateParams));
    dispatch(fetchInvestorCurrencies());
    return () => {
      dispatch(setInvestor(null));
    }
  }, [dispatch, dateRange])

  useEffect(() => {
    if (userInfo && !userInfo.first_login_at) {
      API.registerFirstLogin();
    }
  }, [userInfo])

  if (!investorOwnership || !ownershipConfig) return <></>

  const investedFunds = investorOwnership.invested_funds;
  const isLegacy = false;
  let aggregateCurrency = null;
  if(currencyFeatureFlag?.is_active) {
    aggregateCurrency = selectedCurrency === "investor_currency" ? selectedCurrency : "company_currency"
  }
  const totalRow = createTotalRow(investedFunds, isLegacy, aggregateCurrency);

  const hasHelpLocation = location.hash === USER_GUIDE;
  const isFirstLogin = userInfo && !userInfo.first_login_at;
  const showWelcomeModal = isFirstLogin || hasHelpLocation;

  return <>
    {showWelcomeModal && <WelcomeModal/>}
    {!investorOwnership.has_data && <NoDataToast/>}
    <TopDashboard totalRow={totalRow} hasData={investorOwnership.has_data} setDateRange={setDateRange} dateRange={dateRange}/>

    {isSmall ? <TableTabsView/> : <DesktopViewTables/>}
    <LoggedInFooter/>
  </>
};

export default InvestorOwnership;
