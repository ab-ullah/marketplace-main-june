import OverviewSection from "./components/OverviewSection";
import TabTable from "./components/TabTable";
import {useEffect, useMemo, useState} from "react";
import {SUB_TABS} from "./constants";
import NoteOutlinedIcon from "@material-ui/icons/NoteOutlined";
import StatsTable from "../../../StatsTable";
import DealsSection from "./components/DealsSection";
import { useGetExportForStats } from "../../../../../../components/ExportButton";
import filter from "lodash/filter";
import CommitmentsSection from "./components/CommitmentsSection";
import { useGetCommitmentTabViewFlagQuery } from "../../../../../../api/rtkQuery/commonApi";
import isEmpty from "lodash/isEmpty";

interface IFundDetailView {
    fundId: string;
    fundData: any;
    handleFundName: (arg1: string) => void;
    goBack: () => void;
}

const FundDetailView = ({fundId, fundData, handleFundName, goBack}: IFundDetailView) => {
    const [tab, setTab] = useState<string>(SUB_TABS.OVERVIEW);
    const [state, setState] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { data: commitmentTabView} = useGetCommitmentTabViewFlagQuery()
    const exportButton = useGetExportForStats()

    const handleUpdateState = (key: string, value: any) => {
        setState((prev: any) => ({ ...prev, [key]: value }));
    };

    const searchFilter = (data: any) => {
        if (searchQuery && data) {
          switch (tab) {
            case SUB_TABS.OVERVIEW:
              return filter(data, (dat: any) =>
                dat.full_name.toLowerCase().includes(searchQuery.toLowerCase())
              );
            case SUB_TABS.DEALS:
                return filter(data, (dat: any) =>
                    dat.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
            case SUB_TABS.COMMITMENTS:
                return filter(data, (dat: any) =>
                  dat.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                );      
          }
        } else return data;
      };


    const tabsConfig = useMemo(
        () => [
            {
                key: SUB_TABS.OVERVIEW,
                title: "Overview",
                component: (
                    <OverviewSection
                        fundId={fundId}
                        data={{...fundData}}
                        setData={(data) => handleUpdateState(SUB_TABS.OVERVIEW, data)}
                        goBack={goBack}
                    />
                ),
            },
            {
                key: SUB_TABS.DEALS,
                title: "Deals",
                component: (<DealsSection
                    fundId={fundId}
                    data={{...fundData}}
                    setData={(data) => handleUpdateState(SUB_TABS.DEALS, data)}
                    goBack={goBack}
                />),
            },
            commitmentTabView?.is_active?
            {
                key: SUB_TABS.COMMITMENTS,
                title: "Commitments",
                component: (<CommitmentsSection
                    data={{...fundData}}
                    setData={(data) => handleUpdateState(SUB_TABS.COMMITMENTS, data)}
                />) 
            }:{}
        ].filter(elem=>!isEmpty(elem)),
        [state, fundData,commitmentTabView]
    );

    // const additionalButtons = [
    //     {
    //         title: "Change Log",
    //         icon: <NoteOutlinedIcon style={{ height: ".7em" }} />,
    //     },
    // ]

    useEffect(() => {
        const name = state[SUB_TABS.OVERVIEW]?.name;
        if(name) handleFundName(name);
    }, [state[SUB_TABS.OVERVIEW]]);

    useEffect(()=>{
        setSearchQuery("")
    },[tab])
console.log(state,'fund detail state')
    return (
        <>
            <StatsTable
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchPlaceholder="Search"
                tabsConfig={tabsConfig}
                currentTab={tab}
                handleChangeTab={setTab}
                additionalButtons={[exportButton]}
            />

            <TabTable currentTab={tab} data={searchFilter(state[tab]?.tableData)} showGpCommit={Boolean(commitmentTabView?.is_active)}/>
        </>
    );
};

export default FundDetailView;
