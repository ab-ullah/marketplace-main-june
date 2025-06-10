import { useEffect, useMemo, useState } from "react";
import { SUB_TABS } from "./constants";
import StatsTable from "../../../StatsTable";
import TabTable from "./components/TabTable";
import { ITileInfo } from "../../../InfoTileLayout";
import { handleFormatToCurrency } from "../../../../../../utils/currency";
import { get, isEmpty } from "lodash";
import { getSumByProperty, limitCarryDecimalPlaces } from "../../../../../../utils/getValue";
import { useGetExportForStats } from "../../../../../../components/ExportButton";
import { getDealParticipantsExportData, getOverviewSectionColumns } from "./components/TabTable/constants";
import { useGetCarryPlansConfigQuery } from "../../../../../../api/rtkQuery/companyApi";
import { getTooltip } from "../../../FundsPage/components/FundsListView/constants";
import { CARRY_VALUE_LABEL } from "../../../../constants";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import { decimalSubtract } from "../../../../../../utils/decimal";
import InvestmentTranchesTab from "./components/InvestmentTranchesTab";
import API from "../../../../../../api/backendApi"
import { SOURCE_TYPE } from "../../../CommitmentsPage/components/CommitmentModal/components/CommitmentForm/constants";
import CommitmentsSection from "./components/CommitmentsSection";
import { useGetCommitmentTabViewFlagQuery } from "../../../../../../api/rtkQuery/commonApi";

const DealDetailView = ({
  dealDetail,
  goBack,
}: {
  dealDetail: any;
  goBack: () => void;
}) => {
  const [tab, setTab] = useState<string>(SUB_TABS.OVERVIEW);
  const [commitmentsData,setCommitmentsData]=useState({})
  const { data: commitmentTabView} = useGetCommitmentTabViewFlagQuery()
  const {data: carryPlanConfig} = useGetCarryPlansConfigQuery();
  const exportButton = useGetExportForStats({
    fileName: "carry-deal-participants",
    tableColumns: getOverviewSectionColumns(),
    data: getDealParticipantsExportData(get(dealDetail,'participants',[]))
  });

    const tabTableData=useMemo(()=> ({
      [SUB_TABS.OVERVIEW]:get(dealDetail,'participants',[]),
      [SUB_TABS.COMMITMENTS]:get(commitmentsData,'participants',[]),
    }),[JSON.stringify(dealDetail),JSON.stringify(commitmentsData)])

  const tabsConfig = useMemo(
    () => [
      {
        key: SUB_TABS.OVERVIEW,
        title: "Overview",
      },
      {
        key: SUB_TABS.TRANCHES,
        title: "Investment Tranches",
        component: <InvestmentTranchesTab dealId={dealDetail.deal.id} />
      },
      commitmentTabView?.is_active?
      {
        key: SUB_TABS.COMMITMENTS,
        title: "Commitments",
        component: <CommitmentsSection data={commitmentsData}/>
      }:{},
    ].filter(elem=>!isEmpty(elem)),
    [commitmentsData,commitmentTabView]
  );

  const InfoTileData = [
    {
      label: "Number Of Participants",
      value: get(dealDetail, "participants").length,
    },
    { label: "Total Points", value:limitCarryDecimalPlaces(get(dealDetail, "total_points")) },
    {
      label: "Unallocated Points",
      value: limitCarryDecimalPlaces(decimalSubtract(get(dealDetail, "total_points"), getSumByProperty(get(dealDetail, "participants"), "bps")).toString())
        
    },
    {
      label: "Estimated Carry Value",
      value: handleFormatToCurrency(parseInt(get(dealDetail, "deal.estimated_value"))),
      tooltip: getTooltip('estimated_value', carryPlanConfig?.tooltips ?? [])?.tooltip,
      subTitle: get(dealDetail, 'deal.estimated_value_date') && `As of: ${standardizeDate(get(dealDetail, 'deal.estimated_value_date'))}`
    },
    {
      label: CARRY_VALUE_LABEL.fair_market_value,
      value: handleFormatToCurrency(parseInt(get(dealDetail, "deal.fair_market_value"))),
      tooltip: getTooltip('fair_market_value', carryPlanConfig?.tooltips ?? [])?.tooltip,
      subTitle: get(dealDetail, 'deal.fair_market_value_date') && `As of: ${standardizeDate(get(dealDetail, 'deal.fair_market_value_date'))}`
    },
    {
      label: "Distributions",
      value: handleFormatToCurrency(parseInt(get(dealDetail, "deal.distributions"))),
    },
  ];

  const fetchCommitmentsDetail=async()=>{
    const res = await API.fetchCommitmentDetail(get(dealDetail,'deal.external_id'), SOURCE_TYPE.DEAL);
    if(res.success){
      setCommitmentsData(res.data)
    }
  }

  useEffect(()=>{
   if(dealDetail?.deal?.external_id && commitmentTabView?.is_active) fetchCommitmentsDetail()
  },[dealDetail?.deal?.external_id,commitmentTabView?.is_active])

  return (
    <>
     <StatsTable
        tabsConfig={tabsConfig}
        currentTab={tab}
        handleChangeTab={setTab}
        InfoTileData={tab === SUB_TABS.OVERVIEW ? InfoTileData as ITileInfo[] : []}
        additionalButtons={[exportButton]}
      ></StatsTable>
      <TabTable currentTab={tab} data={tabTableData[tab]} />
    </>
  );
};

export default DealDetailView;
