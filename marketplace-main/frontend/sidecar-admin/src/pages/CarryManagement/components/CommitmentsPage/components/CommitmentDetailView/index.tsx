import StatsTable from "../../../StatsTable";
import { getColumns } from "./constants";
import RsSuite from "../../../../../../components/Table/RSuite";
import { filter, get } from "lodash";
import { formatCurrencyWithTwoDecimals } from "../../../../../../utils/currency";
import { useMemo, useState } from "react";

const CommitmentDetailPage = ({ commitDetail }: any) => {
  const InfoTileData = useMemo(()=> [
    {
      label: "Participants",
      value: get(commitDetail, "participants.length"),
    },
    {
      label: "Total Capital Commit",
      value: formatCurrencyWithTwoDecimals(
        get(commitDetail, "total_capital_commit_sum")
      ),
    },
    {
      label: "Cashless Commit",
      value: formatCurrencyWithTwoDecimals(
        get(commitDetail, "cashless_commit_sum")
      ),
    },
    {
      label: "Management Fee Offset",
      value: formatCurrencyWithTwoDecimals(
        get(commitDetail, "management_fee_offset_sum")
      ),
    },
    {
      label: "Salary Reduction",
      value: formatCurrencyWithTwoDecimals(
        get(commitDetail, "salary_reduction_sum")
      ),
    },
  ],[commitDetail]);

  const [searchQuery, setSearchQuery] = useState("");
  const searchFilter = (data: any) => {
    if (searchQuery)
      return filter(data, (dat: any) =>
        dat.participant_full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    else return data;
  };

  return (
    <StatsTable
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      searchPlaceholder="Search within the commitments"
      InfoTileData={InfoTileData}
    >
      <RsSuite
        height="500px"
        allowColMinWidth={false}
        wordWrap={true}
        rowSelection={false}
        columns={getColumns()}
        data={searchFilter(commitDetail?.participants ?? [])}
      />
    </StatsTable>
  );
};

export default CommitmentDetailPage;
