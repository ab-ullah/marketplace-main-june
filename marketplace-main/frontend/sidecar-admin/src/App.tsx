import React, {useEffect, useState} from 'react';
import {Switch, Redirect, useHistory} from 'react-router-dom';
import mixpanel from 'mixpanel-browser';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from "./api";
import Funds from "./pages/Funds";
import {ADMIN_URL_PREFIX} from "./constants/routes";
import FundDemand from "./pages/FundDemand";
import FundInvestors from "./pages/FundInvestors";
import NavBar from "./components/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Users from "./pages/Users";
import {useAuth0} from "@auth0/auth0-react";
import axios from "axios";
import AdminDashboard from "./pages/AdminDashboard";
import CreateFund from "./pages/CreateFund";
import UploadDocuments from "./pages/UploadDocuments";
import {ThemeProvider} from 'styled-components';
import {defaultTheme} from "./theme";
import Company from "./pages/Companies/Details";
import CompanyTokens from "./pages/Companies";
import SignedOut from "./pages/SignedOut";
import EligibilityCriteriaPage from "./pages/EligibilityCriteria";
import CriteriaFlow from "./pages/EligibilityCriteria/components/CriteriaFlow";
import EligibilityCriteriaPreviewPage from "./pages/EligibilityCriteriaPreview";
import './App.css';
import EligibilityFormCreation from "./pages/EligibilityCriteria/components/EligibilityFormCreation";
import {ToastContainer} from "react-toastify";
import FundMarketingPageCreation from "./pages/FundMarketingPageCreation";
import MarketingPages from "./pages/MarketingPages";
import ScreenError from "./components/ScreenError";
import FundMarketingPagePreview from "./pages/FundMarketingPagePreview";
import FundSetup from "./pages/FundSetup";
import FundDetail from "./pages/FundDetail";
import KnowYourCustomer from "./pages/KnowYourCustomer";
import TasksPage from "./pages/Tasks";
import TaskReview from "./pages/TaskReview";
import ApplicationInfo from "./pages/KnowYourCustomer/ApplicationInfo";
import * as Sentry from '@sentry/react';
import FundDocumentFields from './pages/FundDocumentFields';
import Participants from './pages/Participants';
import { get, isEmpty } from 'lodash';
import { logMixPanelEvent } from './utils/mixPanel';
import CarryManagement from './pages/CarryManagement';
import VestingTool, { AS_OF_DATE } from './pages/CarryManagement/components/VestingTool';
import ParticipantDetails from './pages/ParticipantDetails';
import StoreDocuSignResp from './pages/CarryManagement/components/DocumentsPage/components/StoreDocuSignResp';
import { useGetUserInfoQuery } from './api/rtkQuery/commonApi';
import {CARRY_MANAGEMENT, COINVEST, PARTICIPANTS_INDEX_VIEW} from "./constants/featureFlags";
import FeatureFlagsManager from "./utils/FeatureFlagsManager";
import NavableLoader from './components/NavableLoader';
import { CenteredLoaderContainer } from './components/NavableLoader/styles';
import { getCookie } from './utils/cookiesUtils';


function App() {
  const history = useHistory();
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const { data: userInfo, refetch:refetchUserInfo } = useGetUserInfoQuery(undefined, {
    skip: !accessToken,
  })
  const featureFlagManager = new FeatureFlagsManager()
  const [isCarryEnabled, setIsCarryEnabled] = useState<boolean>(false)
  const [isCoinvestEnabled, setIsCoinvestEnabled] = useState<boolean>(false)
  const [isParticipantIndexView, setIsParticipantIndexView] = useState<boolean>(false)
  const [featurePermissionsLoading, setFeaturePermissionsLoading] = useState<boolean>(true)
  const {getAccessTokenSilently, isLoading, isAuthenticated} = useAuth0();

  // TODO: Find better approach for this
  const updateAxiosToken = async (retry: boolean) => {
    try {
      const storedDate = getCookie(AS_OF_DATE) || "";
      axios.defaults.headers.common[AS_OF_DATE]= storedDate
      const token = await getAccessTokenSilently();
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAccessToken(token);
    } catch (e) {
      console.log(e)
      if (retry) {
        setTimeout(() => updateAxiosToken(false), 3000)
      }
    }
  }

  const handleFetchFeaturePermissions = async () => {
    setFeaturePermissionsLoading(true);
  
    try {
      const [carryFeature, coninvestFeature, participantIndexView] = await Promise.all([
        featureFlagManager.isFeatureEnabled(CARRY_MANAGEMENT),
        featureFlagManager.isFeatureEnabled(COINVEST),
        featureFlagManager.isFeatureEnabled(PARTICIPANTS_INDEX_VIEW)
      ]);
  
      setIsCarryEnabled(carryFeature);
      setIsCoinvestEnabled(coninvestFeature);
      setIsParticipantIndexView(participantIndexView);
    } catch (error) {
      console.error('Error fetching feature permissions:', error);
    } finally {
      setFeaturePermissionsLoading(false);
    }
  };
  

  useEffect(() => {
    updateAxiosToken(true);
  }, [getAccessTokenSilently]);

  useEffect(() => {
    if(process.env.REACT_APP_MIX_PANEL_API_KEY)
      mixpanel.init(process.env.REACT_APP_MIX_PANEL_API_KEY, {debug: true});
    return () => {
        localStorage.removeItem('userInfo')
      }
  }, []);

  useEffect(() => {
    if(accessToken){
    handleFetchFeaturePermissions()
  }
  }, [accessToken])

  useEffect(() => {
    history.listen(() => logMixPanelEvent(window.location.pathname));
    logMixPanelEvent(window.location.pathname);
  }, [history]);

  useEffect(() => {
    if (accessToken) {
      refetchUserInfo()
      const isNewlogin = localStorage.getItem('newLogin');
      API.getAdminProfile().then((res: any) => {
        const userEmail = get(res, 'user.email', '');
        if(isNewlogin){
          mixpanel.identify(userEmail);
          mixpanel.track('Login', {
            company: get(res, 'company.name'),
            companySlug: get(res, 'company.slug'),
            environment: process.env.REACT_APP_ENVIRONMENT,
            app: 'Admin'
          });
          localStorage.removeItem('newLogin');
        }
        localStorage.setItem('userInfo', JSON.stringify(res))
      })
    }
  }, [accessToken]);

  if (!isLoading && !isAuthenticated) return <SignedOut/>
  if (!accessToken || isEmpty(userInfo) || featurePermissionsLoading) return <CenteredLoaderContainer>
    <NavableLoader />
  </CenteredLoaderContainer>

  let redirect = `/${ADMIN_URL_PREFIX}/company`
  if(isCoinvestEnabled)
    redirect = `/${ADMIN_URL_PREFIX}/funds`
  if(!isCoinvestEnabled && isCarryEnabled)
    redirect = `/${ADMIN_URL_PREFIX}/carryManagement`

  // TODO: Added this to trigger build in dev
  console.log("");

  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <NavBar isCarryEnabled={isCarryEnabled}
                isCoinvestEnabled={isCoinvestEnabled}
                isParticipantIndexViewEnabled={isParticipantIndexView}/>
        <ToastContainer
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          draggable
          position={'top-center'}
        />
        <Sentry.ErrorBoundary fallback={ScreenError}>
          <Switch>
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/tasks`} exact component={TasksPage}/>
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/tasks/:taskId/review`} exact component={TaskReview}/>
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds`} exact component={Funds}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/fundSetup`} exact component={FundSetup}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/create`} exact component={CreateFund}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/:externalId/demand`} exact component={FundDemand}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/:externalId/investors`} exact component={FundInvestors}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/:externalId/documents`} exact component={UploadDocuments}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/:externalId/applicants/:applicationId`} exact component={ApplicationInfo}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/:externalId/applicants/:recordId`} exact component={KnowYourCustomer}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/:externalId`} exact component={FundDetail}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/eligibility`} exact component={EligibilityCriteriaPage}/>}
            {isCoinvestEnabled && <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/funds/:fund_external_id/fund-document-fields`} exact component={FundDocumentFields}/>}
            {isCarryEnabled &&
                <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/carryManagement`} exact component={CarryManagement}/>
            }
            {isCarryEnabled &&
                <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/carryManagement/vesting-tool`} exact component={VestingTool}/>
            }
            {isCarryEnabled &&
                <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/carryManagement/documents/signature/:envelopeId`} exact component={StoreDocuSignResp}/>
            }
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/dashboard`} exact component={AdminDashboard}/>

            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/users`} exact component={Users}/>
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/company`} exact component={Company}/>
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/participants`} exact component={Participants}/>
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/participants/:participantId`} exact component={ParticipantDetails}/>
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/companies/tokens`} exact component={CompanyTokens}/>

            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/marketingPage`} exact component={MarketingPages}/>
            <ProtectedRoute
              path={`/${ADMIN_URL_PREFIX}/eligibility/:criteriaId/preview`}
              exact
              component={EligibilityCriteriaPreviewPage}
            />
            <ProtectedRoute
              path={`/${ADMIN_URL_PREFIX}/eligibility/:criteriaId/edit`}
              exact
              component={EligibilityFormCreation}
            />
            <ProtectedRoute
              path={`/${ADMIN_URL_PREFIX}/marketingPage/:marketingPageId/edit`}
              exact
              component={FundMarketingPageCreation}
            />
            <ProtectedRoute
              path={`/${ADMIN_URL_PREFIX}/marketingPage/:marketingPageId/preview`}
              exact
              component={FundMarketingPagePreview}
            />
            <ProtectedRoute path={`/${ADMIN_URL_PREFIX}/flow`} exact component={CriteriaFlow}/>
            <Redirect to={redirect}/>
          </Switch>
        </Sentry.ErrorBoundary>
        {/*<LoggedInFooter/>*/}
      </ThemeProvider>
    </>
  )
}

export default App;
