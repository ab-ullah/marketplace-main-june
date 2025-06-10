import React, {FunctionComponent, useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {USER_GUIDE} from "../../constants/urlHashes";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {selectUserInfo} from "../User/selectors";
import {fetchInvestor, fetchInvestorNoticeDetails, fetchInvestorNoticeValuationDetails} from "./thunks";
import {selectNotices, selectNoticesValuation} from "./selectors";
import {setInvestor} from "./noticesSlice";
import {createTotalRow} from "./components/Considerations/computations";
import TopDashboard from "./components/TopDashboard";
import {LoggedInFooter} from "../../components/Footer";
import useScreenWidth from "../../hooks/useScreenWidth";
import DesktopViewTables from "./components/DesktopViewTables";
import WelcomeModal from "../../components/WelcomeCarousel/WelcomeModal";
import API from "../../api"
import {useGetNoticesPageConfigQuery} from "../../api/rtkQuery/pageConfigsApi";
import TableTabsView from './components/TabsView';
import CurrencyToggle from "./components/Considerations/CurrencyToggle";
import {IFundInvestorDetail} from "../../interfaces/fundInvestorDetail";


interface NoticesProps {
  isLegacy: boolean
}


const Notices: FunctionComponent<NoticesProps> = () => {
  const noticeResponse = useAppSelector(selectNotices);
  const noticeValuationsResponse = useAppSelector(selectNoticesValuation);
  const {data: ownershipConfig} = useGetNoticesPageConfigQuery()
  const userInfo: any = useAppSelector(selectUserInfo);
  const dispatch = useAppDispatch();
  const {isSmall} = useScreenWidth();
  const [totalRow, setTotalRow] = useState<any>()
  const [totalRowValuation, setTotalRowValuation] = useState<any>()


  useEffect(() => {
    dispatch(fetchInvestor(null));
    dispatch(fetchInvestorNoticeDetails(null));
    dispatch(fetchInvestorNoticeValuationDetails(null));
    return () => {
      dispatch(setInvestor(null));
    }
  }, [dispatch])

  useEffect(() => {
    if (userInfo && !userInfo.first_login_at) {
      API.registerFirstLogin();
    }
  }, [userInfo])

  useEffect(() => {
    setTotalRow(createTotalRow(noticeResponse?.transactions ? noticeResponse.transactions : []));
    setTotalRowValuation(createTotalRow(noticeValuationsResponse?.transactions? noticeValuationsResponse.transactions : []))
  }, [noticeResponse, noticeValuationsResponse])

  if (!noticeResponse || !ownershipConfig || !noticeValuationsResponse) return <></>
  return <>
    <TopDashboard totalRow={{...totalRow, ...totalRowValuation}} hasData={true}/>
    {/*<div className="ms-auto"><CurrencyToggle/></div>*/}
    {isSmall ? <TableTabsView/> : <DesktopViewTables/>}
    <LoggedInFooter/>
  </>
};

export default Notices;
