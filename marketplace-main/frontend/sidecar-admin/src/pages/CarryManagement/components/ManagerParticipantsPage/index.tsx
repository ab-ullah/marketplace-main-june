import { useMemo, useState } from "react";
import StatsTable from "../StatsTable";
import { PageContainer } from "../styles";
import { SUB_TABS } from "./constants";
import FirmOverviewSection from "./components/FirmOverviewSection";

const ManagerParticipantsPage = () => {
  const [tab, setTab] = useState<string>(SUB_TABS.FIRM_OVERVIEW);
  const tabsConfig = useMemo(
    () => [
      {
        title: "Firm Overview",
        key: SUB_TABS.FIRM_OVERVIEW,
        component: <FirmOverviewSection/>
      },
    ],
    []
  );
  return (
    <PageContainer>
      <StatsTable
        tabsConfig={tabsConfig}
        currentTab={tab}
        handleChangeTab={setTab}
      />
    </PageContainer>
  );
};

export default ManagerParticipantsPage;
