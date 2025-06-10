import StatsTable from "../../../StatsTable";
import { useEffect, useMemo, useState } from "react";
import filter from "lodash/filter";
import { ITileInfo } from "../../../InfoTileLayout";
import { SUB_TABS } from "./constants";
import { flatMap, get, uniq } from "lodash";
import TabTable from "./components/TabTable";
import { useGetExportForStats } from "../../../../../../components/ExportButton";
import CarryPlansExport from "./components/CarryPlansExport";

const CarryPlansListView = ({
  carryPlansData,
  handleSelectPlanToView,
  publishFlagActive
}: {
  carryPlansData: any;
  handleSelectPlanToView: any;
  publishFlagActive:boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<string>(SUB_TABS.CARRY_PLANS);
  const exportOverviewButton = useGetExportForStats();

  const exportButtons = {
    [SUB_TABS.CARRY_PLANS]: <CarryPlansExport />,
    [SUB_TABS.FIRM_OVERVIEW]: exportOverviewButton,
  };

  const tabsConfig = useMemo(
    () => [
      {
        key: SUB_TABS.CARRY_PLANS,
        title: "Carry Plans",
        searchPlaceholder: "Search within the carry plans",
      },
      {
        key: SUB_TABS.FIRM_OVERVIEW,
        title: "Firm Overview",
        searchPlaceholder: "Search within the participants",
      },
    ],
    []
  );
  const InfoTileData = [
    { label: "Carry Plans", value: carryPlansData?.carryPlans?.length },
    {
      label: "Participants",
      value: uniq(flatMap(carryPlansData.carryPlans, "participants")).length,
    },
  ];

  const searchFilter = (data: any) => {
    if (searchQuery) {
      switch (tab) {
        case SUB_TABS.CARRY_PLANS:
          return filter(data, (dat: any) =>
            dat.label.toLowerCase().includes(searchQuery.toLowerCase())
          );
        case SUB_TABS.FIRM_OVERVIEW:
          return {
            ...data,
            participants: filter(data.participants, (dat: any) =>
              dat.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
          };
      }
    } else return data;
  };

  useEffect(() => {
    setSearchQuery("");
  }, [tab]);

  return (
    <>
      <StatsTable
        tabsConfig={tabsConfig}
        currentTab={tab}
        handleChangeTab={setTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder={
          tabsConfig.find((conf: any) => conf.key === tab)?.searchPlaceholder
        }
        InfoTileData={InfoTileData as ITileInfo[]}
        additionalButtons={[exportButtons[tab]]}
        btnBreakpoint="1079px"
      />
      <TabTable
        currentTab={tab}
        handleSelectPlanToView={handleSelectPlanToView}
        data={searchFilter(get(carryPlansData, tab))}
        showStatus={publishFlagActive}
      />
    </>
  );
};

export default CarryPlansListView;
