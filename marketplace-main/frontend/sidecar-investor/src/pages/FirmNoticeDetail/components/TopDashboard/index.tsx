import React, {FunctionComponent, useEffect, useState} from 'react';
import Container from "react-bootstrap/Container";
import {InvestmentTopDashboard} from "./styles";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import StatCardGroup from "./CardGroup";
import {IFundInvestorDetail} from "../../../../interfaces/fundInvestorDetail";
import {useGetFirmNoticesPageConfigQuery} from '../../../../api/rtkQuery/pageConfigsApi';
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {selectFirmNotices, selectFirmNoticesValuations} from "../../selectors";
import first from "lodash/first";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import ArrowBack from "@material-ui/icons/ArrowBack";
import styled from "styled-components";
import {Link, useParams} from "react-router-dom";
import {CardGroup} from "react-bootstrap";
import {useCompanyPrefix} from "../../../../utils/hooks";
import {fetchFirmNotices, fetchFirmNoticesValuations} from "../../thunks";
import {Range} from "react-date-range";
import SideCarDateRangePicker from "../../../../components/DateRangePicker";
import {DatePickerContainer} from "../../../Notices/components/TopDashboard";
import {parseNativeDate, standardizeDate} from "../../../../utils/dateFormatting";
import {useGetInvestmentSummaryDateFilteringFeatureFlagQuery} from "../../../../api/rtkQuery/commonApi";

interface TopDashboardProps {
  totalRow: IFundInvestorDetail
  hasData: boolean
}


const InvestorName = styled.span`
    font-size: 24px;
    font-family: "Inter", sans-serif;
    display: inline-block;
    vertical-align: middle;
    margin-left: ${(props) => `${props.theme.baseLine}px`};
    font-weight: 400;
    color: ${(props) => `${props.theme.palette.common.sectionHeading}px`};

    .currency {
        font-size: 18px;
        margin-left: 10px;
    }
`;

const InvestmentSection = styled(Row)`
    border-bottom: 1px dashed #a3a2a2;
    padding: 0 0 ${(props) => `${props.theme.baseLine / 2}px`};
    margin-bottom: ${(props) => `${props.theme.baseLine}px`};
`;

const StarTextCol = styled(Col)`
    margin-top: ${(props) => `${props.theme.baseLine * 1.5}px`};
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    color: #000000;
`;

const DashboardLink = styled(Link)`
    text-decoration: underline;
    cursor: pointer;
    font-size: 14px;
    font-family: "Quicksand Bold";
    color: #091626;
    margin-bottom: 10px;
`;

const LogoImage = styled.img`
    width: 100px;
    height: 24px;
`;

const StyledCardGroup = styled(CardGroup)`
    @media (max-width: 1230px) {
        padding-left: ${(props) =>
                props.secondGroup && props.isLegacy ? `1.8%` : `0px`} !important;
    }


    @media (max-width: 1200px) {
        display: block !important;
        width: ${(props) => (props.isLegacy ? `51%` : `100%`)};
        margin-top: 0px !important;
        padding-left: 0px !important;
    }

    @media (max-width: 991px) {
        display: block !important;
        width: 100% !important;
        margin-top: 0px !important;
        padding-left: 0px !important;
    }

    .stat-card-body {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }
`;

const TopDashboard: FunctionComponent<TopDashboardProps> = ({totalRow, hasData}) => {
  const {firmId} = useParams<{ firmId: string }>();
  const {data: ownershipConfig} = useGetFirmNoticesPageConfigQuery()
  const { data: dataFilteringFeatureFlag } = useGetInvestmentSummaryDateFilteringFeatureFlagQuery();
  const isDateFilteringEnabled = dataFilteringFeatureFlag?.is_active
  const firmNotices = useAppSelector(selectFirmNotices);
  const firmNoticesValuations = useAppSelector(selectFirmNoticesValuations);
  const {companyPrefix} = useCompanyPrefix()
  const dispatch = useAppDispatch();
  const [filterRange, setFilterRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [filterHeading, setFilterHeading] = useState<string>("Filter dates")

  useEffect(() => {
    const startDate = filterRange[0].startDate
    const endDate = filterRange[0].endDate
    if (startDate && endDate && startDate != endDate){
      dispatch(fetchFirmNotices({firmId: firmId, startDate: startDate, endDate: endDate}));
      dispatch(fetchFirmNoticesValuations({firmId: firmId, startDate: startDate, endDate: endDate}));
      setFilterHeading(`${standardizeDate(parseNativeDate(startDate))} - ${standardizeDate(parseNativeDate(endDate))}`)
    }
  }, [filterRange])

  if (!firmNotices && !firmNoticesValuations) return <></>

  const firmNotice = first(firmNotices) as any;
  const firmValuation = first(firmNoticesValuations) as any;

  const sourceRecord = firmNotice ? firmNotice : firmValuation;
  return <InvestmentTopDashboard>
    <Container fluid>
      <InvestmentSection>
        <DashboardLink to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/notices`}>
          <ArrowBack/> Dashboard
        </DashboardLink>
        <Col>
          <h1 className="hero-dashboard-heading">
            Investments
          </h1>
          {isDateFilteringEnabled && <DatePickerContainer>
            <SideCarDateRangePicker
                heading={filterHeading}
                value={filterRange}
                setValue={setFilterRange}
            />
          </DatePickerContainer>}
          {sourceRecord && <>
              {sourceRecord?.company_logo && (
                  <LogoImage src={sourceRecord?.company_logo} className="lasalle-logo" alt="logo"/>)}
              <InvestorName>
                {sourceRecord.firm.name}
              </InvestorName>
            </>
          }
        </Col>
      </InvestmentSection>
      <StatCardGroup totalRow={totalRow} ownershipConfig={ownershipConfig}/>
      <Row className="{mt-2}">

        <StarTextCol>
          *All metrics are based on the most recent available data.
        </StarTextCol>
      </Row>
    </Container>
  </InvestmentTopDashboard>

};

export default TopDashboard;
