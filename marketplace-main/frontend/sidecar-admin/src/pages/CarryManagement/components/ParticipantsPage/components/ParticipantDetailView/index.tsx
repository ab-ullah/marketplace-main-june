import { useState, useMemo, useEffect } from "react";
import StatsTable from "../../../StatsTable";
import { SUB_TABS } from "./constants";
import OverviewSection from "./components/OverviewSection";
import CoInvestSection from "./components/CoInvestSection";
import CarryAllocationsStep from "./components/CarryAllocationsSection";
import DocumentsSection from "./components/DocumentsSection";
import ParticipantProfile from "./components/ParticipantProfile";
import { COMPENSATION_ADMIN_GROUP } from "../../../../constants";
import { useGetExportForStats } from "../../../../../../components/ExportButton";
import { getCarryPlansColumns } from "./components/CarryAllocationsSection/constants";
import { getEmployeeStatus, processAllocationData, processOverviewAllocationData } from "./utils";
import { StyledBadge } from "../../styled";
import { useFetchEmployeeProfileQuery } from "../../../../../../api/rtkQuery/employeeApi";
import FeatureFlagsManager from "../../../../../../utils/FeatureFlagsManager";
import { TOTAL_COMPENSATION } from "../../../../../../constants/featureFlags";
import ForfeitComp from "./components/ForfeitComp";
import CommitmentsSection from "./components/CommitmentsSection";
import { useGetCommitmentTabViewFlagQuery } from "../../../../../../api/rtkQuery/commonApi";
import { isEmpty } from "lodash";

const ParticipantDetailView = ({
  participantId,
  handleParticipantName,
  goBack
}: {
  participantId: string;
  handleParticipantName: any;
  goBack: ()=>void
}) => {
  const [allocationData, setAllocationData] = useState([]);
  const [hasEntity, setHasEntity] = useState(false);
  const [isTotalCompFeatureEnabled, setIsTotalCompFeatureEnabled] = useState<{permission:boolean, loading:boolean}>({permission:false, loading:true})

  const featureFlagManager = new FeatureFlagsManager()
  const { data: commitmentTabView} = useGetCommitmentTabViewFlagQuery()

  const handlePermissions=async()=>{
    try {
      const resTotalComb = await featureFlagManager.isFeatureEnabled(TOTAL_COMPENSATION)
      console.log(resTotalComb)
    setIsTotalCompFeatureEnabled(prev=>({...prev,permission:resTotalComb}))
    } catch (error) {
      console.error('Error fetching feature permissions:', error);
    } finally{
      setIsTotalCompFeatureEnabled(prev=>({...prev,loading:false}))
    }

  }
  const [overviewExportData, setOverviewExportData] = useState({
    tableColumns: [],
    data: []
  })
  const [coInvestExportData, setCoInvestExportData] = useState({
    tableColumns: [],
    data: []
  })
  const carryAllocationExportButton = useGetExportForStats({
    fileName: 'Carry participants allocations',
    tableColumns: getCarryPlansColumns(hasEntity, []),
    data: processAllocationData(allocationData)
  })
  const overviewExportButton = useGetExportForStats({
    fileName: 'Carry participants allocations',
    tableColumns: overviewExportData.tableColumns,
    data: processOverviewAllocationData(overviewExportData.data)
  })
  const coInvestExportButton = useGetExportForStats({
    fileName: 'Carry Participants - Co-Invest',
    tableColumns: coInvestExportData.tableColumns,
    data: coInvestExportData.data
  })
  const {data: profile, refetch: refetchProfile} = useFetchEmployeeProfileQuery({
    user_id: participantId
  })
  let isCompAdmin = false
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  if (userInfo.groups) {
     isCompAdmin = !!userInfo.groups.find(
      (group: { name: string }) => group.name === COMPENSATION_ADMIN_GROUP
    );
  }

  const [tab, setTab] = useState<string>("");
  const [showForfeitModal, setShowForfeitModal] = useState<boolean>(false);
  const [forfeitLoading, setForfeitLoading] = useState<boolean>(false)

  useEffect(()=>{
    handlePermissions()
  },[])

  useEffect(()=>{
    if(!isTotalCompFeatureEnabled.loading){
      setTab((isCompAdmin && isTotalCompFeatureEnabled.permission) ? SUB_TABS.OVERVIEW : SUB_TABS.CARRY_PLAN)
    }

  },[isTotalCompFeatureEnabled.loading])

  useEffect(() => {
    if(allocationData?.length) {
      setHasEntity(allocationData.some((item: any) => item.entity_name && item.entity_name.trim() !== ''))
    }
  }, [allocationData])

  // const handleUpdateState = (key: string, value: any) => {
  //   setState((prev: any) => ({ ...prev, [key]: value }));
  // };
  const tabsConfig = useMemo(
    () => [
      ...((isCompAdmin && isTotalCompFeatureEnabled.permission)
        ? [
            {
              key: SUB_TABS.OVERVIEW,
              title: "Overview",
              component: (
                <OverviewSection
                  participantId={participantId}
                  handleParticipantName={handleParticipantName}
                  goBack={goBack}
                  setOverviewExportData={setOverviewExportData}
                />
              ),
            },
          ]
        : []),
      {
        key: SUB_TABS.CARRY_PLAN,
        title: "Carry Allocations",
        component: <CarryAllocationsStep participantId={participantId} onDataLoaded={setAllocationData} />,
      },
      commitmentTabView?.is_active?
      {
        key: SUB_TABS.COMMITMENTS,
        title: "Commitments",
        component: <CommitmentsSection/>
      }:{},
      {
        key: SUB_TABS.CO_INVEST,
        title: "Co-Invest",
        component: <CoInvestSection participantId={participantId} setCoInvestExportData={setCoInvestExportData} />,
      },
      {
        key: SUB_TABS.DOCUMENTS,
        title: "Carry Documents",
        component: <DocumentsSection participantId={participantId} />,
      },
      {
        key: SUB_TABS.PROFILE,
        title: "Profile",
        component: <ParticipantProfile participantProfile={profile} refetchProfile={refetchProfile}/>,
      },
    ].filter(elem=>!isEmpty(elem)),
    [showForfeitModal, profile, isTotalCompFeatureEnabled.permission]
  );

  const exportButton = {
    [SUB_TABS.OVERVIEW]: overviewExportButton,
    [SUB_TABS.CARRY_PLAN]: carryAllocationExportButton,
    [SUB_TABS.CO_INVEST]: coInvestExportButton
  }
  
  const additionalButtons = [
    // {
    //   title: "Change Log",
    //   icon: <NoteOutlinedIcon style={{ height: ".7em" }} />,
    // },

    tab === ((isCompAdmin && isTotalCompFeatureEnabled.permission) ? SUB_TABS.OVERVIEW : SUB_TABS.CARRY_PLAN)
      ? {
          title: "Forfeit Carry",
          color: "white",
          background: "#413C69",
          onClick: () => setShowForfeitModal(true),
          // disabled: state[SUB_TABS.OVERVIEW]?.tableData?.length === 0,
        }
      : {},
      exportButton[tab] ?? <></>,
  ].filter((elem) => Object.keys(elem).length > 0);
  if(profile?.status) {
    additionalButtons.push(<StyledBadge status={profile?.status}>{getEmployeeStatus(profile?.status)}</StyledBadge>)
  }

  if(isTotalCompFeatureEnabled.loading) return <></>
  return (
    <>
    {!forfeitLoading &&
      <StatsTable
        tabsConfig={tabsConfig}
        currentTab={tab}
        handleChangeTab={setTab}
        additionalButtons={[...additionalButtons]}
        btnBreakpoint="1200px"
      />
    }

{showForfeitModal &&
      <ForfeitComp
      showForfeitModal={showForfeitModal}
      setShowForfeitModal={setShowForfeitModal}
      participantId={participantId}
      setForfeitLoading={setForfeitLoading}
      forfeitLoading={forfeitLoading}
      />
}

    </>
  );
};

export default ParticipantDetailView;
