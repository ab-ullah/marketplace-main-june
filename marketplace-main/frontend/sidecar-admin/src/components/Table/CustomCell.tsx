import { FC } from "react";
import { Cell, RowDataType } from "rsuite-table";
import get from "lodash/get";

const CustomCell: FC<any> = ({ rowData, column,rowHighlightKey, onRowClick, ...props }) => {
  const color = get(rowData, rowHighlightKey) ? "#FF8A0026" : "transparent";
  return (
    <Cell
      dataKey={column.dataKey}
      style={{ backgroundColor: color, cursor: (onRowClick && !get(rowData,"isFooter"))? "pointer":"default" }}
      {...props}
    >
      {column.Cell
        ? column.Cell(rowData)
        : rowData[column.dataKey as keyof RowDataType]}
    </Cell>
  );
};

export default CustomCell;
