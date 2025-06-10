import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";
import { ITileInfo } from "../../../InfoTileLayout";
import StatsTable from "../../../StatsTable";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";

const DistributionsListView = ({ distributionsData, handleSelectDistToView }: any) => {
  const {
    distributions_count,
    carry_distributions,
    current_carry_in_escrow,
    unallocated_carry_value,
    distributions
  } = distributionsData;

  const InfoTileData = [
    {
      label: "Number of Distributions",
      value: distributions_count,
    },
    {
      label: "Distributions",
      value: formatCurrencyWithTwoDecimals(carry_distributions),
    },
    {
      label: "Escrow",
      value: formatCurrencyWithTwoDecimals(current_carry_in_escrow),
    },
    {
      label: "Unallocated Carry Value",
      value: formatCurrencyWithTwoDecimals(unallocated_carry_value),
    },
  ];
  
  return (
    <>
      <StatsTable InfoTileData={InfoTileData as ITileInfo[]} />
      <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns(handleSelectDistToView)}
          data={distributions ||[]}
          wordWrap={true}
          rowHeight={72}
        />
      </div>
    </>
  );
};

export default DistributionsListView;
