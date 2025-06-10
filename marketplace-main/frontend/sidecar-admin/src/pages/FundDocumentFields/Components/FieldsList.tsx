import React, { FC } from 'react';
import RsuiteTable from "../../../components/Table/RSuite";

interface IFieldShape {
    field_name: string;
    type: string;
    text: string; 
}

interface IFieldsListProps {
    fields: IFieldShape[]
}

const TABLE_COLUMNS = [
    {
        title: "Field Name",
        dataKey: "id",
        flexGrow: 1.5,
        minWidth: 250,
    },
    {
        title: "Type",
        dataKey: "type",
        flexGrow: 1.5,
        minWidth: 250,
    },
    {
        title: "Description",
        dataKey: "text",
        flexGrow: 1.5,
        minWidth: 250,
    },
]

const FieldsList: FC<IFieldsListProps> = ({
    fields
}) => {
    return <RsuiteTable
    height="100%"
    autoHeight
    allowColMinWidth={true}
    wordWrap={true}
    rowSelection={false}
    columns={TABLE_COLUMNS}
    data={fields}
  />
}

export default FieldsList;