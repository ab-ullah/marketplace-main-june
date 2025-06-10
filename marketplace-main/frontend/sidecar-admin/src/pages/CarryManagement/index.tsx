import { useEffect, useMemo, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { TabsContainer } from "./styles";
import { CARRY_MANAGER_GROUP, TABS, TABS_SEARCH_PARAMS } from "./constants";
import FundsPage from "./components/FundsPage";
import ParticipantsPage from "./components/ParticipantsPage";
import CarryPlansPage from "./components/CarryPlansPage";
import DealsPage from "./components/DealsPage";
import { useHistory } from "react-router-dom";
import VestingPage from "./components/VestingPage";
import DocumentsPage from "./components/DocumentsPage";
import DistributionsPage from "./components/DistributionsPage";
import { ShareClasses } from "./components/ShareClasses";
import Vehicles from "./components/VehiclesPage";
import InvestmentTranchesPage from "./components/InvestmentTranchesPage";
import ManagerParticipantsPage from "./components/ManagerParticipantsPage";
import {
    useGetMeAdminUserQuery,
    useGetManagerReportViewFlagQuery,
    useGetCommitmentTabViewFlagQuery
} from "../../api/rtkQuery/commonApi";
import { isEmpty } from "lodash";
import NavableLoader from "../../components/NavableLoader";
import CommitmentsPage from "./components/CommitmentsPage";
import carryApi from "../../api/rtkQuery/carryApi";
import { useDispatch } from "react-redux";
import React from "react";


const CarryManagement = () => {
  const history = useHistory()
  const [tab, setTab] = useState<string | null>(null);
  const [top, setTop] = useState(0)
  const { data: managerReportView } = useGetManagerReportViewFlagQuery()
  const { data: commitmentTabView} = useGetCommitmentTabViewFlagQuery()
  const {data: userInfo} = useGetMeAdminUserQuery()
  const dispatch = useDispatch();

  const isCarryManager = userInfo?.groups?.some((group: any) => group.name === CARRY_MANAGER_GROUP) ?? false;


  useEffect(()=>{
    const mainNav = document.getElementById("main-nav")
    setTop(mainNav?.offsetHeight || 0)
  },[])

  useEffect(() => {
    if(!isEmpty(managerReportView) && !isEmpty(userInfo)){
    const searchParams = new URLSearchParams(window.location.search);
    const paramsTab = searchParams.get("tab");
    const paramstabOption = Object.values(TABS).find((v) => v === paramsTab);
    const allowManagerTab = managerReportView?.is_active
   
    if (!tab) {
      const tabToSelect = isCarryManager ? (allowManagerTab ? TABS.MANAGER : "") 
      : paramstabOption === TABS.MANAGER && !allowManagerTab ? TABS.FUNDS 
      : paramstabOption ?? TABS.FUNDS;
      
      setTab(tabToSelect || "");
    } else if (paramstabOption !== tab) {
      searchParams.set("tab", tab);
      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
  }
  }, [tab,managerReportView,userInfo]);

  useEffect(() => {
    if (tab) {
      const searchParams = new URLSearchParams(window.location.search);

      Object.entries(TABS_SEARCH_PARAMS)
        .filter(([tabKey, tabParams]) => tabKey !== tab && tabParams.length > 0)
        .forEach(([_, paramsToRemove]) => {
          paramsToRemove.forEach((param) => searchParams.delete(param));
        });

      window.history.replaceState({}, "", `?${searchParams.toString()}`);
    }
  }, [tab]);

  const handleTabChange = (value: any) => {
    const searchParams = new URLSearchParams(window.location.search);
    const prevSearchParamsString = searchParams.toString();

    Object.entries(TABS_SEARCH_PARAMS).forEach(([_, paramsToRemove]) => {
      paramsToRemove.forEach((param) => searchParams.delete(param));
    });

    if (prevSearchParamsString.includes(value)) {
      history.replace({
        search: searchParams.toString(),
      });
    }
    if (value !== tab) setTab(value);
  };

  const tabsConfig = useMemo(
    () =>{ 
      console.log(managerReportView,'managerReportView tabsConfig')
      return[
        ...(isCarryManager? [] :[
      { key: TABS.FUNDS, title: "Funds", component: <FundsPage /> },
      { key: TABS.DEALS, title: "Deals", component: <DealsPage/> },
      { key: TABS.INVESTMENT_TRANCHES, title: "Investment Tranches", component: <InvestmentTranchesPage/> },
      {
        key: TABS.CARRY_PLANS,
        title: "Carry Plans",
        component: <CarryPlansPage/>,
      },
      {
        key: TABS.PARTICIPANTS,
        title: "Participants",
        component: <ParticipantsPage />,
      },
      {
        key: TABS.DISTRIBUTIONS,
        title: "Distributions",
        component: <DistributionsPage/>,
      },
      { key: TABS.VESTING, title: "Vesting", component: <VestingPage/> },
      {
        key: TABS.DOCUMENTS,
        title: "Documents",
        component: <DocumentsPage />,
      },
      {
        key: TABS.SHARE_CLASSES,
        title: "Share Classes",
        component: <ShareClasses />,
      },
      {
        key: TABS.VEHICLES,
        title: 'Vehicles',
        component: <Vehicles />
      },
      commitmentTabView?.is_active ?
      {
        key: TABS.COMMITMENTS,
        title: 'Commitments',
        component: <CommitmentsPage/>
      } : {},
    ]),
      managerReportView?.is_active ?
      {
        key: TABS.MANAGER,
        title: "Firm Overview",
        component: <ManagerParticipantsPage/>
      } :{},
      // { key: TABS.VEHICLES, title: "Vehicles", component: <div style={{textAlign:'center'}}>Under Development ...</div> },
    ].filter(elem=>!isEmpty(elem))},
    [managerReportView,isCarryManager, commitmentTabView]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(carryApi.endpoints.fetchManagerFirmOverview.initiate());
    }, 500); 

    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <TabsContainer fluid top={top}>
     { (isEmpty(userInfo) || isEmpty(managerReportView))? <NavableLoader/> :
      <Tabs
        id="carry-management-tab"
        onSelect={handleTabChange}
        activeKey={tab as string}
      >
        {tabsConfig.map((tabConfig) => (
          <Tab
            key={tabConfig.key}
            eventKey={tabConfig.key}
            title={tabConfig.title}
            className="create-form-tab"
          >
            {tab === tabConfig.key && tabConfig.component}
          </Tab>
        ))}
      </Tabs>
}
    </TabsContainer>
  );
};

export default CarryManagement;
