import { SubTitle } from "../../../../../styles";
import API from "../../../../../../../../api/backendApi";
import { useEffect, useState } from "react";
import { useGetCarrySubpoolsFlagQuery } from "../../../../../../../../api/rtkQuery/commonApi";
import RsuiteTable from "../../../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import NavableLoader from "../../../../../../../../components/NavableLoader";
import map from "lodash/map";
import filter from "lodash/filter";
import isEmpty from "lodash/isEmpty";

interface IHurdlesSectionProps {
  refetchCarryDetail: any;
  carryPlanDetail: any;
  handleAllocationClick: (_allocation: any) => void;
}

const HurdlesSection = ({
  refetchCarryDetail,
  carryPlanDetail,
  handleAllocationClick,
}: IHurdlesSectionProps) => {
  const { data: carrySubpoolsFlag } = useGetCarrySubpoolsFlagQuery();
  const isCarrySubpoolsActive = Boolean(carrySubpoolsFlag?.is_active);
  const [hurdlesList, setHurdlesList] = useState<any[] | null>(null);
  const fetchCarryPlanHurdles = async () => {
    const res = await API.fetchCarryHurdles(carryPlanDetail.carryPlanId);
    if (res.success) {
      const data = map(res.data, (hurdle: any) => {
        return {
          ...hurdle,
          rowKey: hurdle.source_allocation.allocation_id,
          ...hurdle.source_allocation,
          ...(!isEmpty(hurdle.impacted_allocations)
            ? {
                children: map(hurdle.impacted_allocations, (elem: any) => ({
                  ...elem,
                  rowKey:`${hurdle.source_allocation.allocation_id}-${elem.allocation_id}`,
                  isSubRow: true,
                })),
              }
            : {}),
        };
      });
      setHurdlesList(data);
    }
  };

  const handleDeleteHurdle = async (_row: any) => {
    const res = await API.deleteHurdleById(_row.id);
    if (res.success) {
      // fetchCarryPlanHurdles()
      refetchCarryDetail();
      setHurdlesList((prev) =>
        filter(prev, (hurdle: any) => hurdle.id !== _row.id)
      );
    }
  };

  useEffect(() => {
    fetchCarryPlanHurdles();
  }, [carryPlanDetail]);
  
  if (!hurdlesList) return <NavableLoader />;
  return (
    <div>
      <SubTitle>Hurdles</SubTitle>
      <RsuiteTable
        height="400px"
        allowColMinWidth={true}
        rowSelection={false}
        columns={getColumns(isCarrySubpoolsActive, handleDeleteHurdle,handleAllocationClick )}
        data={hurdlesList}
        wordWrap={true}
        isTree={true}
        rowKey="rowKey"
      />
    </div>
  );
};

export default HurdlesSection;
