import { each } from "lodash";
import { INotice } from "../../../../interfaces/notices";

const colorRange = ["#AD62AA", "#4A47A3", "#610094", "#03145E", "#003C43", "#135D66", "#5F5D9C"];

export const getColor = (index: number) => {
  return colorRange[index % colorRange.length]
}

export const getChartData = (transactions: any[] | undefined) => {
    const aggregatedData: any = {};
    const chartData: any[] = [];
    let total = 0;
    if(!transactions) return {data: chartData, total}
    each(transactions, (notice: any) => {
      if(aggregatedData[notice.firm_name]){
        aggregatedData[notice.firm_name] = aggregatedData[notice.firm_name] + notice.net_asset_value_usd
        total = total + notice.net_asset_value_usd;
      }
      else {
        aggregatedData[notice.firm_name] = notice.net_asset_value_usd
        total = total + notice.net_asset_value_usd;
      }
    });
    each(Object.keys(aggregatedData), key => {
      chartData.push({
        name: key,
        value: aggregatedData[key]
      })
    })
    return {data: chartData, total};
}