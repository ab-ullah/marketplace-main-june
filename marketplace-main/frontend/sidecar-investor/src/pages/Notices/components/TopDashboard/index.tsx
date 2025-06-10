import React, {FunctionComponent, useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import {InvestmentTopDashboard} from "./styles";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import StatCardGroup from "./CardGroup";
import {IFundInvestorDetail} from "../../../../interfaces/fundInvestorDetail";
import {useGetNoticesPageConfigQuery} from '../../../../api/rtkQuery/pageConfigsApi';
import DOMPurify from 'dompurify';
import ValuationStats from './ValuationStats';
import SideCarDateRangePicker from "../../../../components/DateRangePicker";
import {Range} from "react-date-range";
import styled from "styled-components";
import {useAppDispatch} from "../../../../app/hooks";
import {fetchInvestor, fetchInvestorNoticeDetails, fetchInvestorNoticeValuationDetails} from "../../thunks";
import {parseNativeDate, standardizeDate} from "../../../../utils/dateFormatting";
import {
  useGetInvestmentSummaryDateFilteringFeatureFlagQuery
} from "../../../../api/rtkQuery/commonApi";
interface TopDashboardProps {
  totalRow: IFundInvestorDetail
  hasData: boolean
}

export const DatePickerContainer = styled.span`
  .date-range {
    z-index: 10;
    position: absolute;
  }
`

const TopDashboard: FunctionComponent<TopDashboardProps> = ({totalRow, hasData}) => {
  const { data: ownershipConfig} = useGetNoticesPageConfigQuery()
  const { data: dataFilteringFeatureFlag } = useGetInvestmentSummaryDateFilteringFeatureFlagQuery();
  const dispatch = useAppDispatch();
  const [filterRange, setFilterRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const isDateFilteringEnabled = dataFilteringFeatureFlag?.is_active
  const [filterHeading, setFilterHeading] = useState<string>("Filter dates")

  useEffect(() => {
    const startDate = filterRange[0].startDate
    const endDate = filterRange[0].endDate
    if(startDate && endDate && startDate != endDate){
      dispatch(fetchInvestor({startDate: startDate, endDate: endDate}))
      dispatch(fetchInvestorNoticeDetails({startDate: startDate, endDate: endDate}))
      dispatch(fetchInvestorNoticeValuationDetails({startDate: startDate, endDate: endDate}));
      setFilterHeading(`${standardizeDate(parseNativeDate(startDate))} - ${standardizeDate(parseNativeDate(endDate))}`)
    }
  }, [filterRange])

  return <InvestmentTopDashboard className="hero-dashboard">
    <Container fluid className="hero-dashboard-container">
      <Row>
        <Col>
          {/*<DashboardLink to="#" onClick={()=>window.open(getHomepageUrl(companyPrefix),"_self")}>*/}
          {/*  <ArrowBack /> Investment Opportunities*/}
          {/*</DashboardLink>*/}
          <h1 className="hero-dashboard-heading">Investment Summary</h1>
          {isDateFilteringEnabled &&
              <DatePickerContainer>
                <SideCarDateRangePicker
                    heading={filterHeading}
                    value={filterRange}
                    setValue={setFilterRange}
                />
              </DatePickerContainer>
          }
          <p dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(ownershipConfig?.page_headline)}} />
          <StatCardGroup totalRow={totalRow} ownershipConfig={ownershipConfig}/>
        </Col>
        <Col>
        <ValuationStats />
        </Col>
      </Row>
    </Container>
  </InvestmentTopDashboard>
};

export default TopDashboard;
