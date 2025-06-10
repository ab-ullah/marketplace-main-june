import React, {FunctionComponent} from 'react';
import ArrowBack from "@material-ui/icons/ArrowBack";
import Container from "react-bootstrap/Container";
import { INVESTOR_URL_PREFIX } from "../../../../constants/routes";
import {InvestmentTopDashboard, DashboardLink} from "./styles";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import GlossaryModal from "../../../../components/Glossary/GlossaryModal";
import StatCardGroup from "./CardGroup";
import {IFundInvestorDetail} from "../../../../interfaces/fundInvestorDetail";
import PieChartContainer from "../PieChart";
import {useCompanyPrefix} from '../../../../utils/hooks';
import { getHomepageUrl } from '../../../../utils/routes';
import { useGetOwnershipPageConfigQuery } from '../../../../api/rtkQuery/pageConfigsApi';
import DOMPurify from 'dompurify';
import ReactDateRangePicker from '../../../../components/ReactDateRangePicker';
import { useGetPortfolioFilteringFeatureFlagQuery } from '../../../../api/rtkQuery/commonApi';
import CurrencyDropdown from '../InvestedFunds/CurrencyDropdown';

interface TopDashboardProps {
  totalRow: IFundInvestorDetail
  hasData: boolean
  setDateRange: any
  dateRange: any
}


const TopDashboard: FunctionComponent<TopDashboardProps> = ({totalRow, hasData, setDateRange, dateRange}) => {
  const {data: ownershipConfig} = useGetOwnershipPageConfigQuery()
  const {companyPrefix} =useCompanyPrefix()
  const { data: dataFilteringFeatureFlag } = useGetPortfolioFilteringFeatureFlagQuery();
  const isDateFilteringEnabled = dataFilteringFeatureFlag?.is_active
  const tileCount = ownershipConfig?.tiles?.length;

  return <InvestmentTopDashboard className="hero-dashboard" flex={tileCount && tileCount < 6 ? 32 : 24}>
    <Container fluid className="hero-dashboard-container">
      <Row>
        <Col>
          <DashboardLink to="#" onClick={()=>window.open(getHomepageUrl(companyPrefix),"_self")}>
            <ArrowBack /> Investment Opportunities
          </DashboardLink>
          <h1 className="hero-dashboard-heading">Investor Dashboard <GlossaryModal/></h1>
          <p dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(ownershipConfig?.page_headline)}} />
          <CurrencyDropdown isFullWidth />
          <StatCardGroup totalRow={totalRow} ownershipConfig={ownershipConfig}/>
        </Col>
        <Col>
        {isDateFilteringEnabled &&
        <div className='d-flex justify-content-end'>
            <ReactDateRangePicker range={dateRange} setDateRange={setDateRange}/>
            </div>
            }
          
          {<PieChartContainer totalRow={totalRow} hasData={hasData} ownershipConfig={ownershipConfig}/>}
        </Col>
      </Row>
    </Container>
  </InvestmentTopDashboard>
};

export default TopDashboard;
