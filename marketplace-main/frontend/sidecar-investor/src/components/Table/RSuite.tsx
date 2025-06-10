import React, { FC, useState, useRef, useEffect } from "react";
import { Table, Column, HeaderCell, Cell } from "rsuite-table";
import map from "lodash/map";
import get from "lodash/get";
import size from "lodash/size";
import without from "lodash/without";
import CheckBoxCell from "./CheckboxCell";
import { Wrapper } from "./styles";
import { ITooltip } from "../../interfaces/carryManagement";
import TooltipPopover from "../CarryTooltip/carryTooltip";

interface IColumns {
  title?: any;
  dataKey?: any;
  width?: any;
  Cell?: any;
  tooltip?: ITooltip
}

interface IRSuite {
  isLoading?: boolean;
  allowColMinWidth?: boolean;
  wordWrap?: boolean;
  columns?: IColumns[];
  height?: string;
  data?: any;
  dataKey?: string;
  rowSelection?: boolean;
  headerHeight?: number;
  emptyMessage?: string;
  handleSelectRow?: (data: any) => void;
  align?: string;
  handleOnRowClick?: (data: any) => void;
}

const RsSuite: FC<IRSuite> = ({
  isLoading,
  allowColMinWidth,
  height,
  wordWrap,
  columns,
  data,
  dataKey,
  emptyMessage,
  rowSelection,
  handleSelectRow,
  headerHeight,
  align,
  handleOnRowClick
}) => {
  const [checkValues, setCheckValues] = useState<any[]>([]);
  const [wrapperHeight, setHeight] = useState(0);
  const ref = useRef(null);

  const tableRef = React.useRef();

  const handleCheckCellChange = (value: any) => {
    value = +value;
    let nextCheckValues: any[] = [...checkValues];

    if (nextCheckValues.includes(value)) {
      nextCheckValues = without(nextCheckValues, value);
    } else {
      nextCheckValues.push(value);
    }
    setCheckValues(nextCheckValues);
    if (handleSelectRow) handleSelectRow(nextCheckValues);
  };

  const getTableWidth = (column: any) => {
    const data: any = {};
    if (column.width) data.width = column.width;
    if (column.flexGrow) {
      data.flexGrow = column.flexGrow;
      if (allowColMinWidth)
        data.minWidth = 100;
    }
    if (column.minWidth && allowColMinWidth) data.minWidth = column.minWidth;
    return data;
  };

  const handleRowClick = (row: any, e: any) => {
    if(handleOnRowClick) {
      handleOnRowClick(row)
    }
   if(row.fund_page) window.open(row.fund_page)

  }

  useEffect(() => {
    if (get(ref, "current.clientHeight") && size(data) > 0)
      setHeight(get(ref, "current.clientHeight"));
  }, [data]);

  return (
    <Wrapper style={{ height }}>
      <div className="table-container" ref={ref}>
        <Table
          height={height === "" ? undefined : wrapperHeight}
          autoHeight={height === ""}
          data={data}
          ref={tableRef}
          shouldUpdateScroll={false}
          headerHeight={headerHeight}
          loading={isLoading}
          wordWrap={wordWrap}
          locale={{ emptyMessage }}
          onRowClick={handleRowClick}
          rowHeight={70}
          className='my-table'
        >
          {rowSelection && (
            <Column key="checkColumn" width={56} fixed>
              <HeaderCell className="checkbox-cell">#</HeaderCell>
              <CheckBoxCell
                dataKey={dataKey}
                checked={(value: any) => {
                  return checkValues.includes(value);
                }}
                onChange={handleCheckCellChange}
              />
            </Column>
          )}
          {map(columns, (column: any) => (
            <Column
              key={column.dataKey}
              align={align}
              {...getTableWidth(column)}
              fixed={column?.fixed}
              verticalAlign={'middle'}
              className={wordWrap ? "wrap-word" : ""}
            >
              <HeaderCell style={{ fontFamily: 'Quicksand Medium', fontSize: '18px', paddingLeft: '15px' }}>
                {column.title}
                <TooltipPopover tooltip={column.tooltip} isLight />
                </HeaderCell>
              <Cell style={{ paddingLeft: '16px' }} dataKey={column.dataKey}>{column.Cell}</Cell>
            </Column>
          ))}
        </Table>
      </div>
    </Wrapper>
  );
};

RsSuite.defaultProps = {
  dataKey: "id",
  rowSelection: true,
  allowColMinWidth: true,
  height: "",
  emptyMessage: "No data found.",
  align: "center",
  headerHeight: 40
};

export default RsSuite;
