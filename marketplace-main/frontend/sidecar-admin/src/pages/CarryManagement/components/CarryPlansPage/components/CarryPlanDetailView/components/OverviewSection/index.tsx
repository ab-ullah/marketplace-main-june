import { get, isEmpty } from "lodash";
import { useMemo, useState } from "react";
import NavableLoader from "../../../../../../../../components/NavableLoader";
import {
  generateAllocationsFooterData,
  generateInfoViewData,
  getColumns,
} from "./constants";
import CarryInfoTable from "../CarryInfoTable";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { useGetCarryPointsTransferFlagQuery, useGetCarrySubpoolsFlagQuery } from "../../../../../../../../api/rtkQuery/commonApi";
import SubpoolSection from "../../../CarryPlanModal/components/CarryPlanForm/components/CarryAllocationsStep/components/SubpoolSection";
import PointsTransferModal from "./components/PointsTransferModal";

const OverviewSection = ({
  carryPlanDetail,
  refetchCarryDetail,
  handleAllocationClick
}: {
  carryPlanDetail: Record<string, any>;
  refetchCarryDetail:any;
  handleAllocationClick:(_allocation:any)=>void
}) => {
  const [allocationSelectedForTransfer, setAllocationSelectedForTransfer] = useState({})
  const { data: carrySubpoolsFlag } = useGetCarrySubpoolsFlagQuery();
  const { data: carryPointsTransferFlag } = useGetCarryPointsTransferFlagQuery()
  const carryAllocationsFooterData = useMemo(() => {
    return generateAllocationsFooterData(carryPlanDetail?.allocations || []);
  }, [carryPlanDetail?.allocations]);

  if (isEmpty(carryPlanDetail)) return <NavableLoader />;

  return (
    <>
      <CarryInfoTable info={generateInfoViewData(carryPlanDetail)} />
      {carrySubpoolsFlag?.is_active && <SubpoolSection subpools={get(carryPlanDetail,'sub_pools',[])}/>}
      <div className="mt-5">
        <RsuiteTable
          height=""
          autoHeight={true}
          allowColMinWidth={true}
          rowSelection={false}
          defaultSortBy="issue_date"
          defaultSortType="desc"
          onRowClick={handleAllocationClick}
          columns={getColumns(carrySubpoolsFlag?.is_active && get(carryPlanDetail,'sub_pools',[])?.length>0, carryPointsTransferFlag?.is_active && setAllocationSelectedForTransfer)}
          data={
            !!carryPlanDetail?.allocations.length
              ? [
                  ...(carryPlanDetail?.allocations || []),
                  carryAllocationsFooterData,
                ]
              : []
          }
          wordWrap={true}
          rowHighlightKey="edited"
        />
      </div>

        {!isEmpty(allocationSelectedForTransfer) &&
        <PointsTransferModal 
        handleCloseModal={()=>setAllocationSelectedForTransfer({})}
         selectedAllocation={allocationSelectedForTransfer}
         refreshData={refetchCarryDetail}
         />
        }
    </>
  );
};

export default OverviewSection;
