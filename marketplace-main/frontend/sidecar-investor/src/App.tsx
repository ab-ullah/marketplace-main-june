import React, {useEffect, useState} from 'react';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import mixpanel from 'mixpanel-browser';
import { install } from 'inspectlet-es';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {INVESTOR_URL_PREFIX} from "./constants/routes";
import InvestorOwnership from "./pages/InvestorOwnership";
import Notices from './pages/Notices';
import NavBar from "./components/Navbar";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import {useAuth0} from "@auth0/auth0-react";
import axios from "axios";
import FundInvestorDetail from "./pages/FundInvestorDetail";
import RequestAllocationPage from "./pages/RequestAllocation";
import {ThemeProvider} from 'styled-components';
import {defaultTheme, useCustomStyledTheme} from "./theme";
import SignedOut from "./pages/SignedOut";
import {useAppDispatch, useAppSelector} from "./app/hooks";
import {fetchAdvisorCompanyUsers, fetchUserInfo} from "./pages/User/thunks";
import {selectUserInfo} from "./pages/User/selectors";
import {ISelectOptionNumValue} from "./interfaces/form";
import {SHOW_UNPUBLISHED_FUNDS, VIEW_AS_ADVISOR_HEADER, VIEW_AS_USER_HEADER} from "./constants/headers";
import MobileUserSelector from "./components/CompanyUserSelector/MobileUserSelector";
import Opportunities from "./pages/Opportunities";
import FundProfile from "./pages/FundProfile";
import IndicateInterest from "./pages/IndicateInterest";
import KnowYourCustomer from "./pages/KnowYourCustomer";
import TaxForms from "./pages/TaxForms";
import BankDetailsForm from "./pages/BankDetailsForm";
import AgreementsPage from "./pages/Agreements/index";
import FundDocuments from "./pages/FundDocuments";
import ApplicationView from "./pages/ApplicationView";
import EligibilityCriteriaPage from "./pages/EligibilityCriteria";
import StartPage from "./pages/StartPage";
import * as Sentry from '@sentry/react';
import ScreenError from "./components/ScreenError";
import StoreUserResponse from "./pages/Agreements/StoreUserResponse";
import InitiateWitnessSigning from "./pages/Agreements/components/Witness/InitiateSigning";
import StoreWitnessResponse from "./pages/Agreements/components/Witness/StoreResponse";
import ProgramDoc from "./pages/ProgramDoc";
import StoreDocuSignResp from './pages/ProgramDoc/StoreDocuSignResp';
import IndicationOfInterest from './pages/IndicationOfInterest';
import { logMixPanelEvent } from './utils/mixpanel';
import { get } from 'lodash';
import NotFound from './pages/NotFound';
import NavableLoader from './components/NavableLoader';
import CarryDocumentsAcknowledgementView from "./pages/CarryDocumentsAcknowledgmentView";
import CarryDocumentsSigningView from "./pages/CarryDocumentsSigningView";
import StoreCarryDocusignResponse from "./pages/CarryDocumentsSigningView/Components/StoreDocusignResponse";
import CarryParticipantDashboard from "./pages/CarryParticipantDashboard";
import CarryAllocationDetail from "./pages/CarryParticipantDashboard/AllocationDetail";
import VestingTool, { AS_OF_DATE } from './pages/CarryVestingTool';
import FirmNoticeDetail from "./pages/FirmNoticeDetail";
import { hexToString } from './utils/advisorSelected';
import TotalCompensation from "./pages/TotalCompensation";
import { getCookie } from './utils/cookiesUtils';

const prefixSlug =':company?/'

function App() {
  const history = useHistory();
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [viewAs, setViewAs] = useState<ISelectOptionNumValue | null>(null)
  const [viewAsAdvisor, setViewAsAdvisor] = useState<ISelectOptionNumValue | null>(null)
  const [showUnPublished, setShowUnPublished] = useState<boolean>(false)
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const {getAccessTokenSilently, isLoading, isAuthenticated} = useAuth0();
  const {theme:StyledTheme, loading: StyledLoading, setToken } = useCustomStyledTheme()

  const userInfo = useAppSelector(selectUserInfo);
  const dispatch = useAppDispatch()

  // TODO: Find better approach for this
  const updateAxiosToken = async (retry: boolean) => {
    try {
      const storedDate = getCookie(AS_OF_DATE) || "";
      axios.defaults.headers.common[AS_OF_DATE]= storedDate
      const token = await getAccessTokenSilently();
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAccessToken(token);
      setToken(token)
      setIsFetchingToken(false);
    } catch (e) {
      console.log(e)
      if (retry) {
        setTimeout(() => updateAxiosToken(false), 3000)
      }
    }
  }

  useEffect(() => {
    updateAxiosToken(true);
  }, [getAccessTokenSilently]);

  useEffect(() => {
    updateAxiosToken(true);
    if(process.env.REACT_APP_MIX_PANEL_API_KEY)
      mixpanel.init(process.env.REACT_APP_MIX_PANEL_API_KEY, {debug: true});
    install(Number(process.env.REACT_APP_INSPECTLET_APP_ID));
    return () => {
      localStorage.removeItem('userInfo')
    }
  }, []);

  useEffect(() => {
    if(userInfo) localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, [userInfo]);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchUserInfo());
      dispatch(fetchAdvisorCompanyUsers())
    }

  }, [accessToken, dispatch])

  useEffect(() => {
    history.listen(() => logMixPanelEvent(window.location.pathname));
    logMixPanelEvent(window.location.pathname);
  }, [history]);

  useEffect(() => {
    if (userInfo) {
      const isNewlogin = localStorage.getItem('newLogin');
      if(isNewlogin){
        mixpanel.identify(get(userInfo, 'email'));
        logMixPanelEvent('New login');
        localStorage.removeItem('newLogin');
      }
    }
  }, [userInfo]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mpParam = urlParams.get('mp');

    if (mpParam) {
      localStorage.setItem('mpParam', mpParam);

      urlParams.delete('mp');
      const queryString = urlParams.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
      setIsFetchingToken(true);
    }
  }, []);
  


  const handleViewAsChange = async (selectedOption: ISelectOptionNumValue | null) => {
    axios.defaults.headers.common[VIEW_AS_USER_HEADER] = selectedOption ? selectedOption.value : null;
    setViewAs(selectedOption)
  }

  const handleViewAsAdvisorChange = async (selectedOption: ISelectOptionNumValue | null) => {
    // axios.defaults.headers.common[VIEW_AS_ADVISOR_HEADER] = selectedOption ? selectedOption.value : null;
    localStorage.setItem('advisor_selected',JSON.stringify(selectedOption ||"{}"))
    // setViewAsAdvisor(selectedOption)
    window.location.reload()
  }

  useEffect(()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const advisorSelectedParamHex = urlParams.get('advisor_selected_hex');

    const setAdvisorSelected = (advisorSelected: ISelectOptionNumValue) => {
      if (advisorSelected?.value) {
        axios.defaults.headers.common[VIEW_AS_ADVISOR_HEADER] =
          advisorSelected.value;
        setViewAsAdvisor(advisorSelected);
        localStorage.setItem(
          "advisor_selected",
          JSON.stringify(advisorSelected || "{}")
        );
      }
    };

    if (advisorSelectedParamHex) {
      const advisorSelectedFromParam = JSON.parse(
        hexToString(advisorSelectedParamHex)
      );
      setAdvisorSelected(advisorSelectedFromParam);
      urlParams.delete('advisor_selected_hex');
      const queryString = urlParams.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    } else {
      const advisorSelected = JSON.parse(
        localStorage.getItem("advisor_selected") || "{}"
      );
      setAdvisorSelected(advisorSelected);
    }

    window.addEventListener('message', (event: any) => {
      if (event.data === 'clear-investor-app-local-storage') {
        localStorage.clear();
      }
    });

  },[])

  const handleShowUnpublishedChange = async (showUnpublishedFunds: boolean) => {
    axios.defaults.headers.common[SHOW_UNPUBLISHED_FUNDS] = showUnpublishedFunds;
    setShowUnPublished(showUnpublishedFunds)
  }

  if(isFetchingToken) return  <NavableLoader />;

  if (!isLoading && !isAuthenticated) return <ThemeProvider theme={StyledTheme}>
    <NavBar
      onViewAsChange={handleViewAsChange}
      viewAs={null}
      onViewAsAdvisorChange={handleViewAsAdvisorChange}
      viewAsAdvisor={null}
      showUnPublished={false}
      setShowUnPublished={handleShowUnpublishedChange}
    />
    <Sentry.ErrorBoundary fallback={ScreenError}>
      <Switch>
        <Route path={`/${INVESTOR_URL_PREFIX}/witness/:uuid/sign/:envelopeId`} exact
               component={InitiateWitnessSigning}/>
        <Route path={`/${INVESTOR_URL_PREFIX}/witness/:uuid/submit/:envelopeId`} exact
               component={StoreWitnessResponse}/>
        <Route component={SignedOut}/>
      </Switch>
    </Sentry.ErrorBoundary>
  </ThemeProvider>

  if (!accessToken || !userInfo || StyledLoading) return <></>
  return (
    <>
      <ThemeProvider theme={StyledTheme}>
        <NavBar
          onViewAsChange={handleViewAsChange}
          viewAs={viewAs}
          onViewAsAdvisorChange={handleViewAsAdvisorChange}
          viewAsAdvisor={viewAsAdvisor}
          showUnPublished={showUnPublished}
          setShowUnPublished={handleShowUnpublishedChange}
        />

        <MobileUserSelector
          onChange={handleViewAsChange}
          viewAs={viewAs}
          showUnPublished={showUnPublished}
          setShowUnPublished={handleShowUnpublishedChange}
        />
        <Sentry.ErrorBoundary fallback={ScreenError}>
          <Switch>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/witness/:uuid/sign/:envelopeId`} exact
                   component={InitiateWitnessSigning}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/witness/:uuid/submit/:envelopeId`} exact
                   component={StoreWitnessResponse}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/ownership`} exact component={InvestorOwnership}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/notices`} exact component={Notices}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/:companySlug/opportunities`} exact
                            component={Opportunities}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/detail`} exact
                            component={FundInvestorDetail}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/firms/:firmId/detail`} exact
                            component={FirmNoticeDetail}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/onboarding`} exact
                            component={EligibilityCriteriaPage}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/profile`} exact component={FundProfile}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/interest`} exact
                            component={IndicateInterest}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/amlkyc`} exact component={KnowYourCustomer}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/tax`} exact component={TaxForms}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/application`} exact
                            component={ApplicationView}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/bank_details`} exact
                            component={BankDetailsForm}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/program_doc`} exact
                            component={ProgramDoc}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/review_docs`} exact
                            component={FundDocuments}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/agreements`} exact
                            component={AgreementsPage}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/user-agreement/:envelopeId`} exact
                            component={StoreUserResponse}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:fundSlug/program_doc/:envelopeId/:viewType`} exact
                            component={StoreDocuSignResp}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/start`} exact component={StartPage}/>
            {/* <ProtectedRoute path="/" exact> <Redirect to={`/${INVESTOR_URL_PREFIX}/start`}/> </ProtectedRoute> */}
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/funds/:externalId/indication_of_interest`} 
                            exact component={IndicationOfInterest}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/carry-plans/documents/acknowledgment`} exact
                            component={CarryDocumentsAcknowledgementView}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/carry-plans/documents/signature`} exact
                            component={CarryDocumentsSigningView}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/carry-plans/documents/signature/:envelopeId`} exact
                            component={StoreCarryDocusignResponse}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/carry-plans`} exact
                            component={CarryParticipantDashboard}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/carry-plans/:externalId`} exact
                            component={CarryAllocationDetail}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/carryManagement/vesting-tool`} exact component={VestingTool}/>
            <ProtectedRoute path={`/${prefixSlug}${INVESTOR_URL_PREFIX}/totalCompensation`} exact component={TotalCompensation}/>
            <Route path="*" component={NotFound} />
          </Switch>
        </Sentry.ErrorBoundary>
      </ThemeProvider>
    </>
  )
}

export default App;
