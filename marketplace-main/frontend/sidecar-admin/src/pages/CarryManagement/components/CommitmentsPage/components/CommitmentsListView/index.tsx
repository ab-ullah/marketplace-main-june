import filter from "lodash/filter";
import { useState } from "react";
import StatsTable from "../../../StatsTable";
import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";

const CommitmentsListView = ({
  commitsList,
  handleSelectCommitToView,
}: {
  commitsList: any[];
  handleSelectCommitToView: any;
}) => {
  const [searchQuery, setSearchQuery] = useState("");


  const InfoTileData =[
    {
      label:'Commitments',
      value: commitsList?.length
    }
  ]

  const searchFilter = (data: any) => {
    if (searchQuery)
      return filter(data, (dat: any) =>
        dat.source_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    else return data;
  };
  return (
    <>
      <StatsTable
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search within the commitments"
        InfoTileData={InfoTileData}
      />

      <div className="mt-5">
        <RsuiteTable
          height="400px"
          allowColMinWidth={true}
          rowSelection={false}
          columns={getColumns()}
          onRowClick={handleSelectCommitToView}
          data={searchFilter(commitsList)}
          wordWrap={true}
        />
      </div>
    </>
  );
};

export default CommitmentsListView;
