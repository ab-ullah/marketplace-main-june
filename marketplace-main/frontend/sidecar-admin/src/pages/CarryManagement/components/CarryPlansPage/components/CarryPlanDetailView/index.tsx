import { useMemo, useState } from "react";
import StatsTable from "../../../StatsTable";
import isEmpty from "lodash/isEmpty";
import NavableLoader from "../../../../../../components/NavableLoader";
import { SUB_TABS } from "./constants";
import OverviewSection from "./components/OverviewSection";
import VestingSection from "./components/VestingSection";
import { useGetExportForStats } from "../../../../../../components/ExportButton";
import CarryPools from "./components/CarryPools";
import HurdlesSection from "./components/HurdlesSection";
import AllocationDetails from "./components/AllocationDetails";
import Adjustments from "./components/Adjustments";
import { useGetCarryAdjustmentValueFlagQuery } from "../../../../../../api/rtkQuery/commonApi";

const CarryPlanDetailView = ({
  carryPlanDetail,
  refetchCarryDetail,
  hurdleEnabled,
}: {
  carryPlanDetail: Record<string, any>;
  refetchCarryDetail?: any,
  hurdleEnabled: boolean,
}) => {

  const [tab, setTab] = useState<string>(SUB_TABS.OVERVIEW);
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const {data: carryValueAdjustmentFlag } = useGetCarryAdjustmentValueFlagQuery()
  const adjustmentEnabled = Boolean(carryValueAdjustmentFlag?.is_active)
  const tabsConfig = useMemo(
    () => [
      {
        key: SUB_TABS.OVERVIEW,
        title: "Overview",
        component: <OverviewSection carryPlanDetail={carryPlanDetail} refetchCarryDetail={refetchCarryDetail} handleAllocationClick={(allocation)=>setSelectedAllocation(allocation)}/>,
      },
      {
        key: SUB_TABS.Vesting,
        title: "Vesting",
        component: <VestingSection/>,
      },
      {
        key: SUB_TABS.Pools,
        title: "Pools",
        component: <CarryPools  refetchCarryDetail={refetchCarryDetail}/>,
      },
      hurdleEnabled?
      {
        key: SUB_TABS.HURDLES,
        title: "Hurdles",
        component: <HurdlesSection  refetchCarryDetail={refetchCarryDetail} carryPlanDetail={carryPlanDetail} handleAllocationClick={(allocation)=>setSelectedAllocation(allocation)}/>,
      }:{},
      adjustmentEnabled?
      {
        key: SUB_TABS.ADJUSTMENTS,
        title: "Adjustments",
        component: <Adjustments carryPlanId={carryPlanDetail.carryPlanId} allocations={carryPlanDetail?.allocations || []} handleAllocationClick={(allocation)=>setSelectedAllocation(allocation)}/>,
      }:{}
    ].filter(_tab=>!isEmpty(_tab)),
    [carryPlanDetail,hurdleEnabled,adjustmentEnabled]
  );

  const exportButton = useGetExportForStats()

  if (isEmpty(carryPlanDetail)) return <NavableLoader />;

  return (
    <>
      <StatsTable
        tabsConfig={tabsConfig}
        currentTab={tab}
        handleChangeTab={setTab}
        additionalButtons={[exportButton]}
      />
       <AllocationDetails 
        allocation={selectedAllocation?.allocation_id}
        show={Boolean(selectedAllocation?.allocation_id)}
        onClose={() => setSelectedAllocation(null)}
        />
    </>
  );
};

export default CarryPlanDetailView;
