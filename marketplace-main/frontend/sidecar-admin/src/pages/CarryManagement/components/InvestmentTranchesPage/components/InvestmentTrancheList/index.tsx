import { useState } from "react";
import { handleFormatToCurrency } from "../../../../../../utils/currency";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import { getLatestDate, getSumByProperty, truncateDecimal } from "../../../../../../utils/getValue";
import { CARRY_VALUE_LABEL } from "../../../../constants";
import StatsTable from "../../../StatsTable";
import { filter } from "lodash";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";

const InvestmentTranchesList = ({tranchesList, onSelectTranche}: any) => {

    const [searchQuery, setSearchQuery] = useState("");

    const latestEstimatedValueDate = getLatestDate(tranchesList, 'estimated_value_date');
    const latestFairMarketValueDate = getLatestDate(tranchesList, 'fair_market_value_date');

    const InfoTileData =()=> {
        const totalEstimatedCarryValue = getSumByProperty(tranchesList, "estimated_value")
        const totalFairMarketValue = getSumByProperty(tranchesList, "fair_market_value")
        return [
        { label: "Investment Tranches", value: tranchesList?.length ?? 0 },
        {
          label: CARRY_VALUE_LABEL.total_estimated_value,
          value:  handleFormatToCurrency(truncateDecimal(totalEstimatedCarryValue,0)),
          subTitle: latestEstimatedValueDate && `As of: ${standardizeDate(latestEstimatedValueDate)}`
        },
        {
          label: CARRY_VALUE_LABEL.total_fair_market_value,
          value:  handleFormatToCurrency(truncateDecimal(totalFairMarketValue,0)),
          subTitle: latestFairMarketValueDate && `As of: ${standardizeDate(latestFairMarketValueDate)}`
        },
      ]};

    const searchFilter = (data: any) => {
        if (searchQuery)
          return filter(data, (dat: any) =>
            dat.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        else return data;
      };

    return <>
    <StatsTable
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search within the investment tranches"
        InfoTileData={InfoTileData()}
      />

<div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(onSelectTranche)}
          data={searchFilter(tranchesList)}
          wordWrap={true}
          defaultSortBy=""
        />
      </div>
    </>
}

export default InvestmentTranchesList;