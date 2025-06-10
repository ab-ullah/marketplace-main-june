import RsuiteTable from "../../../../../../components/Table/RSuite";
import { getColumns } from "./constants";
import API from "../../../../../../api/backendApi";
import { useEffect, useState } from "react";
import styled from "styled-components";

const LeftIndentRsuite = styled.div`
  .rs-table-cell-content {
    display: flex;
    justify-content: flex-start;
    padding: 20px;
  }
`;

const VestingListView = ({ selectScheduleToView }: any) => {
  const [vestingSchedulesList, setVestingSchedulesList] = useState([]);
  const handleFetchVestingSchedule = async () => {
    const res = await API.fetchVestingSchedule();
    if (res.success) {
      setVestingSchedulesList(res.data);
    }
  };

  useEffect(() => {
    handleFetchVestingSchedule();
  }, []);
  return (
    <LeftIndentRsuite className="mt-5">
      <RsuiteTable
        height="400px"
        allowColMinWidth={true}
        rowSelection={false}
        columns={getColumns(selectScheduleToView)}
        data={vestingSchedulesList}
        wordWrap={true}
        rowHeight={50}
        rowBordered
      />
    </LeftIndentRsuite>
  );
};

export default VestingListView;
