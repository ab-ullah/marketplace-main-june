import { useEffect, useState } from "react";
import InfoTable from "./components/InfoTable";
import AutoDistribute from "./components/AutoDistribute";
import { SUB_TABS } from "./constants";
import { CustomTabButton } from "./styles";
import ManualDistribute from "./components/ManualDistribute";

const DistributionForm = ({ state, setState }: any) => {
  const [tab, setTab] = useState<string>("");

  const handleResetAllocations = () => {
    setState((prev: any) => ({
      ...prev,
      allocations: prev.originalAllocations,
      net_distribution: 0,
      amount: "",
      escrow: 0,
    }));
  };

  const handleChangeTab = (tabKey: string) => {
    handleResetAllocations();
    setTab(tabKey);
  };

  useEffect(() => {
    if (state.id) {
      if (state.is_manual) setTab(SUB_TABS.MANUAL_DISTRIBUTE);
      else setTab(SUB_TABS.AUTO_DISTRIBUTE);
    }
    else setTab(SUB_TABS.AUTO_DISTRIBUTE)
  }, [state.id]);

  useEffect(() => {
    setState((prev: any) => ({ ...prev, tabName: tab }));
  }, [tab]);
  
  return (
    <div style={{ padding: "20px" }}>
      <InfoTable state={state} setState={setState} />

      {!Boolean(state.id) && (
        <div className="d-flex gap-3">
          <CustomTabButton
            selected={tab === SUB_TABS.AUTO_DISTRIBUTE}
            onClick={() => handleChangeTab(SUB_TABS.AUTO_DISTRIBUTE)}
            disabled={Boolean(state.id)}
          >
            Auto-Distribution
          </CustomTabButton>
          <CustomTabButton
            selected={tab === SUB_TABS.MANUAL_DISTRIBUTE}
            onClick={() => handleChangeTab(SUB_TABS.MANUAL_DISTRIBUTE)}
            disabled={Boolean(state.id)}
          >
            Manual-Distribution
          </CustomTabButton>
        </div>
      )}
      {tab === SUB_TABS.AUTO_DISTRIBUTE && (
        <AutoDistribute state={state} setState={setState} />
      )}
      {tab === SUB_TABS.MANUAL_DISTRIBUTE && (
        <ManualDistribute state={state} setState={setState} />
      )}
    </div>
  );
};

export default DistributionForm;
