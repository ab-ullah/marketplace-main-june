import React, { FunctionComponent, useEffect, useRef } from "react";
import Row from "react-bootstrap/Row";
import size from "lodash/size";
import InvestmentOppotunities from "../../components/StartPage/InvestmentOppotunities";
import ContactSection from "../../components/StartPage/ContactSection";
import {LoggedInFooter} from "../../components/Footer";
import {Section, StartPageWrapper, Wrapper} from "../../components/StartPage/styles";
import {
  useGetActiveApplicationFundQuery,
  useGetInvestedCountQuery, useGetPendingCarryDocumentsQuery,
  useGetUserInProgressWorkflowQuery,
  useGetUserOpportunitiesQuery,
  useGetWithdrawnOpportunitiesQuery,
  api,
  tagTypes
} from "../../api/rtkQuery/tasksApi";
import {useAppSelector} from "../../app/hooks";
import {selectUserInfo} from "../User/selectors";
import NavableLoader from "../../components/NavableLoader";
import StatusBar from "../../components/StartPage/StatusBar";
import {ActiveApplicationsContainer, QuestionDiv, StartPageSectionHeading, TopRow, WelcomeBackText} from "./styles";
import map from "lodash/map";
import {IActiveApplicationFund} from "../../interfaces/applicationStatus";
import Col from "react-bootstrap/Col";
import PendingTask from "../../components/StartPage/PendingTask";
import HelpCenter from "../../components/StartPage/HelpCenter";
import NoDataText from "../../components/NoDataText";
import {NO_PENDING_TASKS_TEXT, OPPORTUNITIES_TEXT_DATA} from "./constants";
import {toLower} from "lodash";
import {useCompanyPrefix} from "../../utils/hooks";
import {useHistory} from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { getAdvisorSelectedFirstName } from "../../utils/advisorSelected";
import {
  useGetCoinvestFeatureFlagQuery,
  useGetInvestmentSummaryDateFilteringFeatureFlagQuery, useGetPortfolioPageFeatureFlagQuery
} from "../../api/rtkQuery/commonApi";

interface StartPageProps {
}

const StartPage: FunctionComponent<StartPageProps> = () => {
  const userInfo = useAppSelector(selectUserInfo);
  const {data: opportunitiesData, isLoading: isLoadingOpportunities} =
    useGetUserOpportunitiesQuery();
    const {data: withdrawnOpportunitiesData, isLoading: isLoadingWithdrawnOpportunities} =
    useGetWithdrawnOpportunitiesQuery();
  const {data: coinvestFeatureFlag } = useGetCoinvestFeatureFlagQuery();
  const {data: portfolioFeatureFlag } = useGetPortfolioPageFeatureFlagQuery();
  const {data: investedCountData} = useGetInvestedCountQuery();
  const {data: inProgressWorkFlow} = useGetUserInProgressWorkflowQuery();
  const {data: activeApplicationFunds, isLoading: isLoadingActiveApplications} = useGetActiveApplicationFundQuery();
  const {data: carryDocuments, isLoading: isLoadingPendingCarryDocuments} = useGetPendingCarryDocumentsQuery();

  const refApp = useRef<HTMLDivElement>(null)
  const refOpp = useRef<HTMLHeadingElement>(null)
  const history = useHistory()
  const {companyPrefix} =useCompanyPrefix()
  const dispatch = useDispatch();

  const scrollToRef = (ref: string) => {

    switch (ref) {
      case 'refApp':
        refApp.current?.scrollIntoView()
        break;
      case 'refOpp':
        refOpp.current?.scrollIntoView()
        break;

      default:
        break;
    }
  }

  useEffect(()=>{
    localStorage.removeItem('mpParam')
  },[])

  useEffect(() => {
      // dispatch(api.util.invalidateTags(tagTypes));
  }, [axios.defaults.headers.common, dispatch]);

  if (!coinvestFeatureFlag?.is_active){
    return (
        <>
          <StartPageWrapper fluid>
            <TopRow className={'mb-4'}>
              {userInfo && <WelcomeBackText>Welcome back, <span>{getAdvisorSelectedFirstName() || userInfo.first_name}</span>!</WelcomeBackText>}
            </TopRow>
          </StartPageWrapper>
          <LoggedInFooter/>
        </>
    );
  }

  if (isLoadingOpportunities || isLoadingPendingCarryDocuments || isLoadingActiveApplications) {
    return (
      <>
        <Wrapper fluid hasLoader={true}>
          <NavableLoader/>
        </Wrapper>
        <LoggedInFooter/>
      </>
    )
  }

  let carryDocumentsURL = `${companyPrefix}/investor/carry-plans/documents/acknowledgment`
  if (!carryDocuments?.pending_acknowledgment_count) {
    carryDocumentsURL = `${companyPrefix}/investor/carry-plans/documents/signature`
  }

  return (
    <>
      <StartPageWrapper fluid>
        <TopRow className={'mb-4'}>
          {userInfo && <WelcomeBackText>Welcome back, <span>{getAdvisorSelectedFirstName() || userInfo.first_name}</span>!</WelcomeBackText>}
          <StatusBar
            opportunitiesCount={size(opportunitiesData)}
            investmentsCount={investedCountData ? investedCountData.invested_count : 0}
            activeApplicationCount={size(activeApplicationFunds)}
            scrollTo={scrollToRef}
            showActiveInvestments={portfolioFeatureFlag?.is_active}
          />
        </TopRow>
        <Section>
          <ActiveApplicationsContainer ref={refApp}>
            <div><StartPageSectionHeading>Tasks</StartPageSectionHeading></div>
            <div className={'scrollable'}>
              {size(activeApplicationFunds) === 0 && !carryDocuments?.count ? <NoDataText text={NO_PENDING_TASKS_TEXT}/> :
                <Row>
                  {map(activeApplicationFunds, (fundDetail: IActiveApplicationFund) => {
                    const actionRequired = toLower(fundDetail.application_status) == "changes_requested"
                    const applicationUrl = `${companyPrefix}/investor/funds/${fundDetail.external_id}/application`
                    let subtexts = [fundDetail.focus_region, fundDetail.type, fundDetail.focus_region]
                    return <Col md={6} sm={12} className={'mb-3'}>
                      <PendingTask
                          action_required={actionRequired}
                          header={fundDetail.name}
                          onClick={() => history.push(applicationUrl)}
                          subtexts={subtexts}/>
                    </Col>
                  })}
                  {Boolean(carryDocuments?.count) &&
                   <Col md={6} sm={12} className={'mb-3'}>
                        <PendingTask
                            action_required={false}
                            header={`${carryDocuments?.count} pending carry document${carryDocuments?.count === 1 ? "" : "s"}`}
                            onClick={() => history.push(carryDocumentsURL)}
                            subtexts={[]}
                            simpleButton
                            />
                      </Col>
}
                </Row>}
            </div>
          </ActiveApplicationsContainer>
        </Section>
        <Section>
          <InvestmentOppotunities
            textData={OPPORTUNITIES_TEXT_DATA.NOT_STARTED}
            isLoading={isLoadingOpportunities}
            opportunities={opportunitiesData}
            scrollRef={refOpp}
          />
        </Section>
        <Section>
          <InvestmentOppotunities
            textData={OPPORTUNITIES_TEXT_DATA.WITHDRAWN}
            isLoading={isLoadingWithdrawnOpportunities}
            opportunities={withdrawnOpportunitiesData?.map(obj => ({ ...obj, status: 'withdrawn' }))}
          />
        </Section>
      </StartPageWrapper>
      <QuestionDiv>
        <ContactSection/>
        <HelpCenter/>
      </QuestionDiv>
      <LoggedInFooter/>
    </>
  );
};

export default StartPage;
