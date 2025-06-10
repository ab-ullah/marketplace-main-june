import { each } from "lodash";
import React, { useMemo } from "react";
import { Col } from "react-bootstrap";
import { useAppSelector } from "../../../../app/hooks";
import RsuiteTable from "../../../../components/Table/RSuite";
import { selectGroups } from "../../selectors";

const getColumns = () => [
    {
        title: "Name",
        dataKey: "name",
        width: 300,
      },
      {
        title: "Description",
        dataKey: "description",
        width: 1000,
      },
]

const GroupsList = () => {

    const groups = useAppSelector(selectGroups)

    return  <RsuiteTable
    height="calc(100vh - 288px)"
    rowSelection={false}
    columns={getColumns()}
    data={groups}
  />
}

export default GroupsList;