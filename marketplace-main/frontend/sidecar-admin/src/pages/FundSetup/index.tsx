import React, {FunctionComponent, useEffect, useState} from 'react';
import {Tab, Tabs} from "react-bootstrap";
import {SetupContainer, StepContainer} from "./styles";
import EligibilityCriteriaWithHeader from './components/EligibilityCriteriaWithHeader';
import FundSetupContent from './components/FundSetup';
import Applicants from './components/Applicants';
import {IFundBaseInfo} from "../../interfaces/fundDetails";
import {
  ACCEPT_APPLICATIONS_SUBTEXT,
  ACCEPT_APPLICATIONS_TEXTS,
  ELIGIBILITY_CRITERIA_TEXTS,
  FUND_DOCUMENTS_TEXTS,
  FUND_SETUP_INFORMATION_TEXTS,
  PUBLISH_INDICATION_OF_INTEREST_TEXTS,
  PUBLISH_INVESTMENT_DETAILS_SUBTEXT,
  PUBLISH_INVESTMENT_DETAILS_TEXTS,
  PUBLISH_OPPORTUNITY_TEXTS,
  TABS
} from "./constants";
import {ITaskDetail} from '../../interfaces/Workflow/task';
import {resetFundSetup} from "./fundSetupSlice";
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import CapitalCallsSection from './components/CapitalCallsSection';
import DistributionNoticesSection from './components/DistributionNoticesSection';
import Step, {Status} from "./components/FundSetup/components/Step"
import {Button} from "./components/FundSetup/styles";
import {useUpdateFundStatusMutation} from "../../api/rtkQuery/fundsApi";
import {IActionTypes, modalsConfig} from "../Funds/components/FundsList/Actions";
import ConfirmationModal from "../Funds/components/FundsList/ConfirmationModal";
import get from "lodash/get";
import SidecarModal from "../../components/SidecarModal";
import FundDocuments
  from "../EligibilityCriteria/components/EligibilityFormCreation/components/CriteriaForm/components/FundDocuments";
import CarryManagementSection from './components/CarryManagementSection';
import API from "../../api/backendApi";
import {exportInterest} from "../FundDetail/components/AnalyticsView/components/IndicationOfInterest/ExportView";
// @ts-ignore
import {useJsonToCsv} from 'react-json-csv';
import FundCriteriaTable from "../EligibilityCriteria/components/FundCriteriaList/components/FundCriteriaTable";
import IsReadyToPublish from "./components/IsReadyToPublish";
import CreateCriteriaButton from "../EligibilityCriteria/components/FundCriteriaList/components/CreateCriteriaModal";
import {LeftSideComponentsContainer, RightSideComponentsContainer} from "../../components/Header/styles";
import styled from "styled-components";
import FeatureFlagManager from "../../utils/FeatureFlagsManager";
import {CAPITAL_CALLS_FUND_SETUP, DISTRIBUTION_NOTICES_FUND_SETUP} from "../../constants/featureFlags";
import EditFundDocument from '../EligibilityCriteria/components/EligibilityFormCreation/components/CriteriaForm/components/FundDocuments/EditFundDocument';
import {selectFund} from "../FundDetail/selectors";
import {fetchFund, fetchFundDetail} from "../FundDetail/thunks";

const {
  getUserInfo,
} = API;

interface FundDemandProps {
  task?: ITaskDetail | null
}

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
`


const FundSetup: FunctionComponent<FundDemandProps> = ({ task }) => {
  const [tab, setTab] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<null | IActionTypes>(null);
  const [editDocumentFund, setEditDocumentFund] = useState<any | IFundBaseInfo>(null);
  const [editFundDocument, setEditFundDocument] = useState<any>(null);
  const currentFund = useAppSelector(selectFund);
  const dispatch = useAppDispatch()
  const [updateFundStatus] = useUpdateFundStatusMutation()
  const {saveAsCsv} = useJsonToCsv();
  const handleClose = () => {
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCapitalCallsActive, setIsCapitalCallsActive] = useState<boolean>(false);
  const [isDistributionNoticesActive, setIsDistributionNoticesActive] = useState<boolean>(false);
  const featureFlagManager = new FeatureFlagManager()


  const handleFetchUserInfo = async () => {
    const res = await getUserInfo();
    setIsAdmin(res?.is_sidecar_admin);
  };

  const handleFeatureFlags = async () => {
    const res = await getUserInfo();
    setIsAdmin(res?.is_sidecar_admin);
    const resCapitalCalls = await featureFlagManager.isFeatureEnabled(CAPITAL_CALLS_FUND_SETUP)
    const resDistributionNotices = await featureFlagManager.isFeatureEnabled(DISTRIBUTION_NOTICES_FUND_SETUP)
    setIsCapitalCallsActive(resCapitalCalls)
    setIsDistributionNoticesActive(resDistributionNotices)
  };

  const handleSubmit = (actionKey: IActionTypes) => {
    let params: {}
    if(currentFund){
      const fundId = currentFund.id
      if(![IActionTypes.reOpenApplications, IActionTypes.CloseIndicationOfInterest].includes(actionKey)){
        params = {fundId , [actionKey]: true }
      } else if(actionKey === IActionTypes.CloseIndicationOfInterest) {
        params = {fundId, [IActionTypes.PublishIndicationOfInterest]: false }
      } else {
        params = {fundId, [IActionTypes.CloseApplications]: false }
      }
      updateFundStatus(params)
          .then(() => {
            dispatch(fetchFund(currentFund.external_id));  // Dispatch an action to refresh the fund details
            dispatch(fetchFundDetail(currentFund.external_id));  // Dispatch an action to refresh the fund details
          })
          .finally(() => setActiveModal(null));
    }
  };

  useEffect(() => {
    handleFetchUserInfo();
    const searchParams = new URLSearchParams(window.location.search);
    const paramsTab = searchParams.get('tab');
    const paramstabOption = Object.values(TABS).find(v => v === paramsTab);
    if (!tab) {
      setTab(paramstabOption || TABS.FUND_SETUP);
    } else if(tab && task){
      setTab(paramstabOption || TABS.APPLICANTS_MANAGEMENT);
    }
     else if (paramstabOption !== tab) {
      searchParams.set('tab', tab);
      window.history.replaceState({}, '', `?${searchParams.toString()}`);
    }
    handleFeatureFlags()
  }, [tab])

  useEffect(() => {
    handleFetchUserInfo()
    handleFeatureFlags()
    return () => {
      dispatch(resetFundSetup())
    }
  }, [])

  if (!tab) return null;
  if (!currentFund) return null;

  let applicationStatus;
  if (currentFund.can_start_accepting_applications && currentFund.accept_applications) {
    applicationStatus = Status.Completed
  } else if(!currentFund.can_start_accepting_applications && !currentFund.accept_applications) {
    applicationStatus = Status.NotReady
  } else {
    applicationStatus = Status.StartNow
  }

  return <SetupContainer fluid>
    <Tabs id="currentFund-setup-tab" onSelect={setTab} activeKey={tab}>
      <Tab eventKey={TABS.FUND_SETUP} title="Fund Setup" className="create-form-tab">
        <StepContainer>
          <Step texts={FUND_SETUP_INFORMATION_TEXTS}
                stepNumber="1" subText="" title={"Fund Information"} optional={false}/>
          <FundSetupContent fund={currentFund}/>
        </StepContainer>

        <StepContainer>
          <Step texts={PUBLISH_INDICATION_OF_INTEREST_TEXTS}
                stepNumber="2" subText="" title={"Publish Indication of Interest"} optional={true} status={currentFund.open_for_indication_interest ? Status.Completed : Status.StartNow}>
          </Step>
          <Actions>
            {!currentFund.open_for_indication_interest && <Button onClick={(e: any) => {
              e.preventDefault();
              setActiveModal(IActionTypes.PublishIndicationOfInterest);
              handleClose();
            }} variant={'primary'} className={"mb-3"}>Publish Indication of Interest</Button>}
            {currentFund.open_for_indication_interest && <><Button onClick={(e: any) => {
              e.preventDefault();
              setActiveModal(IActionTypes.CloseIndicationOfInterest);
              handleClose();
            }} variant={'primary'} className={"mb-3"}>Close Indication of Interest</Button>
              <Button variant={'primary'} className={'mb-3 float-right'} onClick={async () => {
                await exportInterest(currentFund.external_id, saveAsCsv)
              }}>Export Indication of Interest</Button>
            </> }
          </Actions>
        </StepContainer>

        <StepContainer>
          <Step texts={PUBLISH_OPPORTUNITY_TEXTS}
                stepNumber="3" subText="" title={"Publish Opportunity"} optional={false} status={currentFund.is_published ? Status.Completed :  Status.StartNow}>
          </Step>
          <Actions>
            {!currentFund.is_published && (
                <Button onClick={(e: any) => {
                  e.preventDefault();
                  setActiveModal(IActionTypes.PublishOpportunity);
                  handleClose();
                }} variant={'primary'} className={"mb-3"}>Publish Opportunity</Button>
            )}
            {currentFund.is_published && (
                <Button onClick={() => {}} disabled={!currentFund.is_published} variant={'primary'} className={"mb-3"}>Opportunity Published</Button>
            )}
          </Actions>
        </StepContainer>

        <StepContainer>
          <Step texts={ELIGIBILITY_CRITERIA_TEXTS}
                stepNumber="4" subText="" title={"Eligibility Rules"} optional={false} status={currentFund.has_eligibility_criteria ? Status.Completed : Status.StartNow}>
          </Step>
          <div>
            <IsReadyToPublish fundId={currentFund.id} shouldRefresh={true}/>
            <CreateCriteriaButton fund={currentFund} />
            <FundCriteriaTable fund={currentFund} height={"calc(100vh - 688px)"} />
          </div>
        </StepContainer>

        <StepContainer>
          <Step texts={FUND_DOCUMENTS_TEXTS}
                stepNumber="5" subText="" title={"Fund Documents"} optional={false}>
          </Step>
          <Button onClick={(e: any) => {
            e.preventDefault();
            setEditDocumentFund(currentFund);
          }} variant={'primary'} className={"mb-3"}>Manage Documents</Button>
          <SidecarModal
              title={`${editDocumentFund ? editDocumentFund.name : ""} Documents`}
              showModal={editDocumentFund !== null && editFundDocument === null}
              handleClose={() => setEditDocumentFund(null)}
          >
            {editDocumentFund && editDocumentFund.id ? (
                <FundDocuments fund={editDocumentFund} onUpdateFundDocument={(document: number) => {setEditFundDocument(document)}} />
            ) : (
                <></>
            )}
          </SidecarModal>
          <SidecarModal
            title="Update Fund Document"
            showModal={editFundDocument !== null}
            handleClose={() => setEditFundDocument(null)}
          >
            {editFundDocument ? <EditFundDocument 
              fundDocument={editFundDocument}
              fund={editDocumentFund}
              handleClose={() => setEditFundDocument(null)}
              /> : <></>}
          </SidecarModal>
        </StepContainer>

        <StepContainer>
          <Step texts={ACCEPT_APPLICATIONS_TEXTS}
                stepNumber="6" subText={ACCEPT_APPLICATIONS_SUBTEXT} title={"Accept Applications"} optional={false} status={applicationStatus}>
          </Step>
            <LeftSideComponentsContainer>
              {currentFund.close_applications &&
                  <Button onClick={(e: any) => {
                    e.preventDefault();
                    handleClose();
                    if(currentFund.has_eligibility_criteria){
                      setActiveModal(IActionTypes.reOpenApplications);
                    }
                  }} variant={'primary'} className={"mb-3"}>Reopen Applications</Button>
              }
              {!currentFund.accept_applications &&
                  <Button disabled={!currentFund.can_start_accepting_applications} onClick={(e: any) => {
                    e.preventDefault();
                    handleClose();
                    if(currentFund.has_eligibility_criteria){
                      setActiveModal(IActionTypes.AcceptApplications);
                    }
                  }} variant={'primary'} className={"mb-3"}>Accept Applications</Button>
              }
            </LeftSideComponentsContainer>
            <RightSideComponentsContainer>
              {!currentFund.close_applications &&
                  <Button onClick={(e: any) => {
                    e.preventDefault();
                    handleClose();
                    setActiveModal(IActionTypes.CloseApplications);
                  }} variant={'primary'} className={"mb-3"}>Close Applications</Button>
              }
            </RightSideComponentsContainer>
        </StepContainer>

        <StepContainer>
          <Step texts={PUBLISH_INVESTMENT_DETAILS_TEXTS}
                stepNumber="7" subText={PUBLISH_INVESTMENT_DETAILS_SUBTEXT} title={"Publish Investment Details"} optional={false} status={currentFund.publish_investment_details ? Status.Completed : Status.StartNow}>
          </Step>
          <Button disabled={currentFund.publish_investment_details} onClick={(e: any) => {
            e.preventDefault();
            setActiveModal(IActionTypes.PublishInvestmentDetails);
            handleClose();
          }} variant={'primary'} className={"mb-3"}>Publish Investment Details</Button>
        </StepContainer>
        <ConfirmationModal
            title={get(modalsConfig, `${activeModal}.title`, "")}
            showModal={activeModal !== null}
            handleClose={() => setActiveModal(null)}
            handleSubmit={() => (activeModal ? handleSubmit(activeModal) : "")}
        >
          {activeModal && <>{modalsConfig[activeModal].getMsg(currentFund.name)}</>}
        </ConfirmationModal>
      </Tab>
      <Tab eventKey={TABS.ELIGIBILITY_CRITERIA} title="Eligibility Criteria" className="create-form-tab">
        {tab === TABS.ELIGIBILITY_CRITERIA && (<EligibilityCriteriaWithHeader fund={currentFund} />)}
      </Tab>
      <Tab eventKey={TABS.APPLICANTS_MANAGEMENT} title="Applicant Management" className="create-form-tab">
        {tab === TABS.APPLICANTS_MANAGEMENT && (<Applicants fund={currentFund} task={task}/>)}
      </Tab>
      {isCapitalCallsActive && <Tab eventKey={TABS.CAPITAL_CALLS} title="Capital Calls" className="create-form-tab" >
        {tab === TABS.CAPITAL_CALLS && <CapitalCallsSection />}
      </Tab>}
      {isDistributionNoticesActive && <Tab eventKey={TABS.DISTRIBUTION_NOTICES} title="Distribution Notices" className="create-form-tab" >
        {tab === TABS.DISTRIBUTION_NOTICES && <DistributionNoticesSection />}
      </Tab>}
    </Tabs>
  </SetupContainer>
};

export default FundSetup;
