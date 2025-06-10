import StatsTable from "../../../StatsTable";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { standardizeDate } from "../../../../../../utils/dateFormatting";
import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";
import { ITileInfo } from "../../../InfoTileLayout";
import { getColumns } from "./constants";
import { getSumByProperty } from "../../../../../../utils/getValue";
import { isEmpty } from "lodash";

const DistributionDetailView = ({ distDetail }: any) => {
  const { amount, date, escrow, total_participants, allocations, source, unallocated_points, total_points, is_manual } = distDetail;

  const InfoTileData = [
    {
      label: "Gross Distributions",
      value: formatCurrencyWithTwoDecimals(amount),
    },
    {
      label: "Participant Escrow",
      value: formatCurrencyWithTwoDecimals(escrow),
    },
    {
      label: "Distribution Date",
      value: standardizeDate(date),
    },
    {
      label: "Net Distributions",
      value: formatCurrencyWithTwoDecimals(getSumByProperty(allocations,"net_distribution")),
    },
    is_manual?{}:
    {
      label: "Unallocated Carry Value",
      value: formatCurrencyWithTwoDecimals((unallocated_points * amount /total_points)),
    },
    {
      label: "Participants",
      value: total_participants,
    },
  ].filter((elem)=>!isEmpty(elem));

  return (
    <>
      <StatsTable title={source} InfoTileData={InfoTileData as ITileInfo[]} />
      <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns()}
          data={allocations || []}
          wordWrap={true}
          rowHeight={72}
        />
      </div>
    </>
  );
};

export default DistributionDetailView;
