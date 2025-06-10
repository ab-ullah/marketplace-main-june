import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useFetchDealInvestmentTranchesQuery } from "../../../../../../../../api/rtkQuery/carryApi"
import NavableLoader from "../../../../../../../../components/NavableLoader";
import RsSuite from "../../../../../../../../components/Table/RSuite";
import { columns } from "./utils";
import { useMemo } from "react";
import { getSumByProperty, truncateDecimal } from "../../../../../../../../utils/getValue";
import { handleFormatToCurrency } from "../../../../../../../../utils/currency";
import InfoTileLayout, { ITileInfo } from "../../../../../InfoTileLayout";

const InvestmentTranchesTab = ({dealId}: {dealId: string}) => {
    const {data: dealInvestmentTranches, isLoading, isFetching} = 
    useFetchDealInvestmentTranchesQuery(dealId ? dealId : skipToken);

    const info = useMemo(() => {
        const totalEstimatedCarryValue = getSumByProperty(dealInvestmentTranches ?? [], "estimated_value")
        const totalFairMarketValue = getSumByProperty(dealInvestmentTranches ?? [], "fair_market_value")
        const totalDistributions = getSumByProperty(dealInvestmentTranches ?? [], "distributions")
        return [
            {
              label: "Investment Tranches",
              value: dealInvestmentTranches?.length ?? 0,
            },
            {
              label: "Estimated Value",
              value:  handleFormatToCurrency(truncateDecimal(totalEstimatedCarryValue,0)),
            },
            {
              label: "Fair Market Value",
              value:  handleFormatToCurrency(truncateDecimal(totalFairMarketValue,0))
            },
            {
              label: "Distributions",
              value:  handleFormatToCurrency(truncateDecimal(totalDistributions,0)),
            },
          ];
    }, [dealInvestmentTranches])


    if(isLoading || isFetching) return <NavableLoader />

    return <>
    <InfoTileLayout data={info as ITileInfo[]} />
    <RsSuite 
        height="500px"
        allowColMinWidth={false}
        wordWrap={true}
        rowSelection={false}
        columns={columns}
        data={dealInvestmentTranches ?? []}
    />
    </>
    
}

export default InvestmentTranchesTab

