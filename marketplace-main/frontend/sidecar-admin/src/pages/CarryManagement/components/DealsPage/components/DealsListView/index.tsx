import filter from "lodash/filter";
import { useState } from "react";
import { getLatestDate, getSumByProperty, truncateDecimal } from "../../../../../../utils/getValue";
import { handleFormatToCurrency } from "../../../../../../utils/currency";
import StatsTable from "../../../StatsTable";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import { useGetExportForStats } from "../../../../../../components/ExportButton";
import { getTooltip } from "../../../FundsPage/components/FundsListView/constants";
import { CARRY_VALUE_LABEL } from "../../../../constants";
import { useGetCarryPlansConfigQuery } from "../../../../../../api/rtkQuery/companyApi";
import { standardizeDate } from "../../../../../../utils/dateFormatting";

const DealsListView = ({dealsList,handleSelectDealToView}:{dealsList:any[],handleSelectDealToView:any}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const {data: carryPlanConfig} = useGetCarryPlansConfigQuery();
  const exportButton = useGetExportForStats({
    fileName: 'carry plan deals',
    tableColumns: getColumns(handleSelectDealToView, []),
    data: dealsList
  })
  const latestEstimatedValueDate = getLatestDate(dealsList, 'estimated_value_date');
  const latestFairMarketValueDate = getLatestDate(dealsList, 'fair_market_value_date');

  const searchFilter = (data: any) => {
    if (searchQuery)
      return filter(data, (dat: any) =>
        dat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    else return data;
  };

  const InfoTileData =()=> {
    const totalEstimatedCarryValue = getSumByProperty(dealsList, "estimated_value")
    const totalFairMarketValue = getSumByProperty(dealsList, "fair_market_value")
    const totalDistributions = getSumByProperty(dealsList, "distributions")
    return [
    { label: "Deals", value: dealsList.length },
    {
      label: CARRY_VALUE_LABEL.total_estimated_value,
      value:  handleFormatToCurrency(truncateDecimal(totalEstimatedCarryValue,0)),
      tooltip: getTooltip('estimated_value', carryPlanConfig?.tooltips ?? [])?.tooltip,
      subTitle: latestEstimatedValueDate && `As of: ${standardizeDate(latestEstimatedValueDate)}`
    },
    {
      label: CARRY_VALUE_LABEL.total_fair_market_value,
      value:  handleFormatToCurrency(truncateDecimal(totalFairMarketValue,0)),
      tooltip: getTooltip('fair_market_value', carryPlanConfig?.tooltips ?? [])?.tooltip,
      subTitle: latestFairMarketValueDate && `As of: ${standardizeDate(latestFairMarketValueDate)}`
    },
    {
      label: "Distributions",
      value:  handleFormatToCurrency(truncateDecimal(totalDistributions,0)),
    },
  ]};

  return (
    <>
      <StatsTable
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search within the deals"
        InfoTileData={InfoTileData()}
        additionalButtons={[exportButton]}
      />

      <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(handleSelectDealToView, carryPlanConfig?.tooltips ?? [])}
          data={searchFilter(dealsList)}
          wordWrap={true}
          defaultSortBy=""
        />
      </div>
    </>
  );
};

export default DealsListView;
