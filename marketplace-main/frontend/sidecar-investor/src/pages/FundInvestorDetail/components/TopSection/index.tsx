import {IFundInvestorDetail} from "../../../../interfaces/fundInvestorDetail";
import {FunctionComponent} from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useParams} from "react-router";
import {Params} from "../../../TaxForms/interfaces"
import {Card, CardGroup} from "react-bootstrap";
import {InvestmentTopDashboard} from "./styles";
import InvestorProfileSelector from "../../../../components/InvestorProfileSelector";
import {OptionTypeBase} from "react-select";
import styled from "styled-components";
import GlossaryModal from "../../../../components/Glossary/GlossaryModal";
import {INVESTOR_URL_PREFIX} from "../../../../constants/routes";
import {Link} from "react-router-dom";
import ArrowBack from "@material-ui/icons/ArrowBack";
import {standardizeDate} from "../../../../utils/dateFormatting";
import StatToolTip from "../../../../components/GlossaryToolTip/StatBlockToolTip";
import {useGetCompanyInfoQuery, useGetPortfolioFilteringFeatureFlagQuery} from "../../../../api/rtkQuery/commonApi";
import {useGetInvestmentDetailPageConfigQuery} from "../../../../api/rtkQuery/pageConfigsApi";
import {IInvestmentStat} from "../../../../interfaces/PageConfigs/investmentDashboard";
import {filterColumns, getDisplayValue} from "../../../../utils/RenderTablesDynamically";
import { useCompanyPrefix } from "../../../../utils/hooks";
import ReactDateRangePicker from "../../../../components/ReactDateRangePicker";
import CurrencyDropdown from "../../../InvestorOwnership/components/InvestedFunds/CurrencyDropdown";

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

interface InfoWrapProps {
}

const WrapInCol: FunctionComponent<InfoWrapProps> = ({children}) => (
  <Col>{children}</Col>
);

interface InfoHeaderProps {
  fundInvestorDetail: IFundInvestorDetail;
  availableOptions: OptionTypeBase[];
  investorProfile: OptionTypeBase | null | undefined;
  setInvestorProfile: (arg0: OptionTypeBase) => void;
  setDateRange: any
  dateRange: any
  currencySymbol: string;
  currencyRate: number;
}


const TopSection: FunctionComponent<InfoHeaderProps> = ({
                                                          fundInvestorDetail,
                                                          investorProfile,
                                                          setInvestorProfile,
                                                          availableOptions,
                                                          setDateRange,
                                                          dateRange,
                                                          currencyRate,
                                                          currencySymbol
                                                        }) => {
  const {externalId} = useParams<Params>();
  const {companyPrefix} =useCompanyPrefix()
  const {data: companyInfo} = useGetCompanyInfoQuery(externalId, {skip: !externalId});
  const {data: investorDetailPageConfig} = useGetInvestmentDetailPageConfigQuery(externalId)
  const { data: dataFilteringFeatureFlag } = useGetPortfolioFilteringFeatureFlagQuery();
  const isDateFilteringEnabled = dataFilteringFeatureFlag?.is_active
  const isLegacy = fundInvestorDetail.is_legacy;
  const offerLeverage = fundInvestorDetail.offer_leverage;

  if (!investorDetailPageConfig) return <></>
  let tiles = (
    <>
      <StyledCardGroup isLegacy={isLegacy}>
        {filterColumns(investorDetailPageConfig.tiles, isLegacy, !offerLeverage).map((tile: IInvestmentStat) => {
          return <Card className={'ms-0'}>
            <Card.Body>
              <div className={'stat-card-body'}>
                <div className="heading">
                  {tile.heading} {tile.tooltip ? <StatToolTip
                  heading={tile.tooltip.heading}
                  description={tile.tooltip.description}
                /> : <></>}
                </div>
                <div className="value">
                  {getDisplayValue(
                    fundInvestorDetail,
                    tile,
                    currencySymbol,
                    currencyRate
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        })
        }
      </StyledCardGroup>
    </>
  );

  tiles = isLegacy ? tiles : <WrapInCol children={tiles}/>;
  return (
    <InvestmentTopDashboard>
      <Container fluid>
        <InvestmentSection>
          <DashboardLink to={`${companyPrefix}/${INVESTOR_URL_PREFIX}/ownership`}>
            <ArrowBack /> Investor Dashboard
          </DashboardLink>
          <Col>
          <div className="d-flex justify-content-between">
            <h1 className="hero-dashboard-heading">
              My Investments <GlossaryModal/>
            </h1>
           {isDateFilteringEnabled && <ReactDateRangePicker range={dateRange} setDateRange={setDateRange}/>}
            </div>
            {companyInfo?.company_logo && (
              <LogoImage src={companyInfo?.company_logo} className="lasalle-logo" alt="logo"/>)}
            <InvestorName>
              {fundInvestorDetail.fund_display_name ? fundInvestorDetail.fund_display_name : fundInvestorDetail.fund_name || fundInvestorDetail?.name}
              <span className={"currency"}>
                ({fundInvestorDetail.currency?.code})
              </span>
            </InvestorName>
            <div>
            <InvestorProfileSelector
              options={availableOptions}
              value={investorProfile}
              onChange={setInvestorProfile}
            />
            <CurrencyDropdown />
            </div>
          </Col>
        </InvestmentSection>
        {fundInvestorDetail.invested_since && <Row>
          <p>
            Invested since {standardizeDate(fundInvestorDetail.invested_since)}
          </p>
        </Row>}
        <Row lg={2}>{tiles}</Row>
        <Row className="{mt-2}">
          {isLegacy ? (
            <StarTextCol>
              *Metrics are based on the most recent available data. Some metrics
              are not available for Legacy Program Investments. Please contact
              the investment fund management team for more information.
            </StarTextCol>
          ) : (
            <StarTextCol>
              *All metrics are based on the most recent available data.
            </StarTextCol>
          )}
        </Row>
      </Container>
    </InvestmentTopDashboard>
  );
};

export default TopSection;

