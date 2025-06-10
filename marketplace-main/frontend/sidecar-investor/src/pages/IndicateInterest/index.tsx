import React, { FunctionComponent, useEffect, useState } from 'react';
import API from '../../api';
import FundProfileHeader from "./components/Header";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import LoggedInFooter from "../../components/Footer";
import {useParams} from "react-router-dom";
import {fetchFundProfile} from "./thunks";
import {selectIndicateInterestFund} from "./selectors";
import IndicateInterestForm from "./components/DetailsForm";


interface FundProfileProps {
}


const IndicateInterest: FunctionComponent<FundProfileProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();
  const dispatch = useAppDispatch()
  const fund = useAppSelector(selectIndicateInterestFund);
  const [analyticsReported, setAnalyticsReported] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchFundProfile(externalId))
  }, [])

  useEffect(() => {
    if (fund && !analyticsReported) {
      API.reportFundIndicationOfInterestView(fund.id)
      setAnalyticsReported(true)
    }
  }, [fund, analyticsReported])

  if (!fund) return <></>

  return <div>
    <FundProfileHeader fund={fund}/>
    {!fund.indicated_interest && <IndicateInterestForm fund={fund}/>}
    {/*<ContactInfo email={companyProfile.contact_email} whiteBg={true}/>*/}
    <LoggedInFooter/>
  </div>
};

export default IndicateInterest;
