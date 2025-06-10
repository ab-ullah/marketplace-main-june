import _ from "lodash";
import { TABS } from "../../constants";
import CarryAllocationsStep from "./components/CarryAllocationsStep";
import CarryPlanStep from "./components/CarryPlanStep";
import { useGetCarrySubpoolsFlagQuery } from "../../../../../../../../api/rtkQuery/commonApi";

const CarryPlanForm = ({
  tab,
  state,
  setState,
  carryPlanOptions,
  errors,
  setErrors,
  mode,
  refreshData,
  handleCloseModal,
}: any) => {
  const { data: carrySubpoolsFlag } = useGetCarrySubpoolsFlagQuery();

  const handleChange = (key: string, value: any) => {
    setState((prev: any) => ({ ...prev, [key]: value }));
    setErrors((prev: any) => ({ ...prev, [key]: undefined }));
  };
  if (tab === TABS.CARRY_PLAN)
    return (
      <CarryPlanStep
        state={state}
        errors={errors}
        handleChange={handleChange}
        carryPlanOptions={carryPlanOptions}
        isCarrySubpoolsActive={carrySubpoolsFlag?.is_active}
      />
    );
  if (tab === TABS.CARRY_ALLOCATIONS)
    return (
      <CarryAllocationsStep
        firstStepData={state}
        handleChange={handleChange}
        mode={mode}
        isCarrySubpoolsActive={carrySubpoolsFlag?.is_active}
        handleCloseModal={handleCloseModal}
        refreshData={refreshData}
      />
    );
  return <></>;
};

export default CarryPlanForm;
