import React, {FunctionComponent, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {fetchFundInvestorDetail, fetchInvestorProfiles} from "./thunks";
import {selectFundInvestorDetail, selectInvestorProfileOptions} from "./selectors";
import InfoTable from "./components/InfoTable";
import {OptionTypeBase} from "react-select";
import TopSection from "./components/TopSection";
import {LoggedInFooter} from "../../components/Footer";
import NoDataToast from "../../components/NoDataToast";
import {useGetInvestmentDetailPageConfigQuery} from "../../api/rtkQuery/pageConfigsApi";
import {IInvestmentTable} from "../../interfaces/PageConfigs/investmentDashboard";
import {filterTables} from "../../utils/RenderTablesDynamically";
import NotificationsList from "../InvestorOwnership/components/Notifications";
import {uniq} from 'lodash';
import ExportButton from '../../components/ExportButton';
import {generateDateParamsFromRange} from '../../utils/dateFormatting';
import {useGetFundDetailsQuery} from '../../api/rtkQuery/fundsApi';
import {getCSVColumns} from './utils';
import get from "lodash/get";
import { selectCurrency } from '../InvestorOwnership/selectors';
import {fetchInvestorCurrencies} from "../InvestorOwnership/thunks";


interface FundInvestorsProps {
}

const FundInvestorDetail: FunctionComponent<FundInvestorsProps> = () => {
  const {externalId} = useParams<{ externalId: string }>();
  const [investorProfile, setInvestorProfile] = useState<OptionTypeBase | null | undefined>(null);
  const [dateRange, setDateRange] = useState({startDate: null, endDate: null})
  const dispatch = useAppDispatch();
  const fundInvestments = useAppSelector(selectFundInvestorDetail);
  const selectedCurrency = useAppSelector(selectCurrency);
  const investorProfileOptions = useAppSelector(selectInvestorProfileOptions);
  const {data: fundDetails} = useGetFundDetailsQuery(externalId)
  const {data: investorDetailPageConfig} = useGetInvestmentDetailPageConfigQuery(externalId)

  useEffect(() => {
    dispatch(fetchInvestorProfiles());
    dispatch(fetchInvestorCurrencies());
  }, [])

  useEffect(() => {
    const dateParams = generateDateParamsFromRange(dateRange)
    dispatch(fetchFundInvestorDetail({externalId, dateParams}))
  }, [dateRange])

  useEffect(() => {
    const availableInvestorIds = uniq(fundInvestments?.map(investment => investment.investor))
    if (!availableInvestorIds) return;

    let investorExists = false
    if (investorProfile) {
      investorExists = availableInvestorIds.indexOf(investorProfile.value) > -1;
    }
    if (!investorProfile || !investorExists) {
      const firstProfile = investorProfileOptions.find(p => p.value === availableInvestorIds[0])
      setInvestorProfile(firstProfile)
    }
  }, [investorProfileOptions, fundInvestments])

  if (!investorDetailPageConfig) {
    return <></>
  }

  const fundInvestorDetail = fundInvestments?.filter(investment => investment.investor === investorProfile?.value)
  if (!fundDetails) return <></>

  const availableInvestorIds = uniq(fundInvestments?.map(investment => investment.investor))
  const availableOptions = investorProfileOptions.filter(profile => availableInvestorIds.indexOf(profile.value) > -1)

  let currencySymbol = fundDetails?.currency?.symbol;
  let currencyRate = fundDetails?.currency?.rate;

  const data = fundInvestorDetail[0] || fundDetails;

  if(get(data, `${selectedCurrency}`)) {
    const conversionRate = get(data, `${selectedCurrency}.conversion_rate`);
    currencySymbol = get(data, `${selectedCurrency}.symbol`);
    currencyRate = conversionRate || 1;
  }
  return <>
    {!fundInvestorDetail[0]?.has_data && <NoDataToast/>}
    <TopSection
      dateRange={dateRange}
      setDateRange={setDateRange}
      fundInvestorDetail={data}
      availableOptions={availableOptions}
      investorProfile={investorProfile}
      setInvestorProfile={setInvestorProfile}
      currencyRate={currencyRate}
      currencySymbol={currencySymbol}
    />
    {fundInvestorDetail[0] && <>
      {filterTables(investorDetailPageConfig.tables, fundInvestorDetail[0], fundInvestorDetail[0].is_legacy).map((detailTable: IInvestmentTable) => {
        let data : any = fundInvestorDetail;
        const nestedKey = detailTable.nested_key
        if (nestedKey) {
          data = []
          fundInvestorDetail?.map(detail => {
            const nestedData = get(detail, nestedKey)
            if (nestedData) {
              data = [...data, ...nestedData]
            }
          })
        }
        return <section>
          <div className="d-flex justify-content-between">
            <h2 className="section-title">{detailTable.heading}</h2>
            <ExportButton
              fileName={detailTable.heading}
              tableColumns={getCSVColumns(detailTable.rows, data[0]?.is_legacy)}
              data={data}/>
          </div>
          <InfoTable
            infoRows={data}
            // colWidth="20%"
            currencySymbol={currencySymbol}
            currencyRate={currencyRate}
            columnConfigs={detailTable.rows}
          />
        </section>
      })}
      <section>
        <h2 className="section-title">Notifications & Documents</h2>
        <NotificationsList
          key={`${investorProfile?.value}-${fundInvestorDetail[0]?.fund}`}
          viewInvestorId={investorProfile?.value}
          viewFundId={fundInvestorDetail[0]?.fund}
          hideDueDate={investorDetailPageConfig?.hide_due_date}
        />
      </section>
    </>}

    <LoggedInFooter/>
  </>
};

export default FundInvestorDetail;
